import './App.css';
import { useRef, useEffect, useState } from 'react';
import NodeControlPanel from './NodeControlPanel';
import { nodeUIList, topologyData } from './nodesUI';
import { serverRestApi, Protocol, servergRpcApi } from './serverApiCommunication';

class ConsoleLine {
    id: string = "";
    text: string = "";
    aliveUntil: number = 0;
    error: boolean = false;
}

declare global {
    interface Window {
        currentSse?: { close?: () => void, cancel?: () => void };    
    }
}

function App() {
    const [currentNodeSelected, setNodeSelected] = useState(-1)
    const [consoleContent, setConsoleContent] = useState<Array<ConsoleLine>>([])
    const [currentSubscriptionId, setCurrentSubscriptionId] = useState(-1)
    const [nodeActiveStates, setNodeActiveStates] = useState<boolean[]>(
        topologyData.devices.map(device => device.active)
    )
    const [selectedProtocol, setSelectedProtocol] = useState<Protocol>(Protocol.REST)
    const consoleIdRef = useRef(0)
    
    /* On component init */
    useEffect( () => {
        function onConsoleUpdate() {
            // check if any line timed out -> if yes then remove 
            const currentTime = Date.now();
            setConsoleContent(prev => prev.filter(line => line.aliveUntil > currentTime));
        }

        /* check every half second if need to clear console */
        const intervalId = setInterval(() => {
            onConsoleUpdate()
        }, 500);

        return () => clearInterval(intervalId);
    }, [])

    /* funcin to add/change console line data */
    function pushLineToConsole(text: string, error: boolean = false, displayTime: number = 30) {
        const aliveUntil = Date.now() + displayTime * 1000;
        const id = `${Date.now()}-${consoleIdRef.current++}`
        setConsoleContent(prev => [...prev, { id, text, aliveUntil, error }]);
        return id;
    }
    function replaceConsoleLine(id: string, text: string, error: boolean = false, displayTime: number = 30) {
        const aliveUntil = Date.now() + displayTime * 1000;
        setConsoleContent(prev => prev.map(line => line.id === id ? { ...line, text, error, aliveUntil } : line));
    }

    /* Close Connection with server data steam */
    const closeConnection = () => {
        if (window.currentSse) {
            if (window.currentSse.close) window.currentSse.close();  // Dla REST
            if (window.currentSse.cancel) window.currentSse.cancel(); // Dla gRPC
            window.currentSse = undefined;
        }
    }

    /* Button handlers */
    async function onSubscribeButtonPressed(nodeIndex: number, state: boolean) { // state true = subscribe, false = unsubscribe 
        if (nodeIndex < 0 || nodeIndex >= nodeUIList.length) return;

        const nodeName = nodeUIList[nodeIndex].name.toUpperCase();
        const pendingId = pushLineToConsole(`Subscribing to ${nodeName}`, false, 30);
        setCurrentSubscriptionId(nodeIndex)

        // if unsubscribing
        if (!state) {
            if (nodeIndex === currentSubscriptionId) {
                pushLineToConsole(`Unsubscribing from ${nodeName}`, true);
                setCurrentSubscriptionId(-1);
                closeConnection();
            }
            return;
        }

        // close previous connection
        if (currentSubscriptionId !== -1) {
            pushLineToConsole(`Unsubscribing from previous connection with ${nodeUIList[currentSubscriptionId].name.toUpperCase()} (id ${currentSubscriptionId})`, true);
            closeConnection()
        }
        setCurrentSubscriptionId( nodeIndex )

        // get event data stream from server api (either protocol)
        if (selectedProtocol === Protocol.REST) {
            // --- REST ---
            const eventSource = serverRestApi.getSubscriptionEventSource(nodeIndex);
            window.currentSse = eventSource;

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handleIncomingData(data, pendingId, nodeName);
            };
            eventSource.onerror = () => {
                replaceConsoleLine(pendingId, `SSE Error for ${nodeName}`, true);
                closeConnection();
            };
        } else {
            // --- gRPC ---
            const stream = servergRpcApi.subscribeToNode(
                nodeIndex,
                (data) => handleIncomingData(data, pendingId, nodeName),
                (err) => {
                    replaceConsoleLine(pendingId, `gRPC Stream Error: ${err.message}`, true);
                    closeConnection();
                }
            );
            window.currentSse = stream as any;
        }
    }

    function handleIncomingData(data: any, pendingId: string, nodeName: string) {
        // Pomocnicza funkcja do formatowania list id
        const formatNodes = (ids: number[]) => {
            if (!ids || ids.length === 0) return "none";
            return ids
                .map(id => `${nodeUIList[id].name.toUpperCase()}(id ${id})`)
                .join(', ');
        };

        if (data.type === 'INITIAL_STATE') {
            replaceConsoleLine(pendingId, `Subscribed to: ${nodeName}. Reachable devices: [${formatNodes(data.deviceIds)}]`, false );
        } else if (data.type === 'ADDED') {
            pushLineToConsole( `[${nodeName}] Nodes now reachable: [${formatNodes(data.deviceIds)}]`, false );
        } else if (data.type === 'REMOVED') {
            pushLineToConsole(`[${nodeName}] Nodes now unreachable: [${formatNodes(data.deviceIds)}]`, true );
        }
    };

    async function onToggleNode(nodeIndex: number, newState: boolean) {
        setNodeActiveStates(prev => prev.map((active, idx) => idx === nodeIndex ? newState : active));

        const nodeName = nodeUIList[nodeIndex].name.toUpperCase();
        const pendingId = pushLineToConsole(`${newState ? 'Turning on' : 'Turning off'} ${nodeName} via ${selectedProtocol}...`, false, 30);
        
        let errorMsg = "";
        let success = false;

        if (selectedProtocol === Protocol.REST) {
            const res = await serverRestApi.toggleNode(nodeIndex, newState);
            success = !res.error && res.data !== false;
            errorMsg = res.errorMsg;
        } else {
            const res = await servergRpcApi.toggleNode(nodeIndex, newState);
            success = res.success;
            errorMsg = res.errorMsg || "gRPC Unknown Error";
        }

        if (!success) {
            replaceConsoleLine(pendingId, `Error toggling ${nodeName}: ${errorMsg}`, true);
        } else {
            replaceConsoleLine(pendingId, `Node ${nodeName} has been ${newState ? 'enabled' : 'disabled'}`);
        }
    }
    function onNodeHoverStateChange(index:number, newState: boolean) {
        setNodeSelected( newState ? index : -1 )
    }       

    return (
        <div> 
            {/* Title and credits */}
            <div id='credits'> 
                <div id='app-title'> Network Manager (Systemy Rozproszone) </div>
                <p> Labolatorium 4 - Middleware - zadanie A2 - gRPC </p>
                <p> by: <i> Dominik Matuszczyk </i> (2026) </p>
                {/* <p> *pozycje na mapie niekoniecznie odpowiadają prawdziwym </p> */}

                {/* Comms selection */}
                Communication protocol: 
                <select id="comms-selection-dropdown" value={selectedProtocol} onChange={(e) => setSelectedProtocol(Protocol[e.target.value as keyof typeof Protocol])}> 
                    <option value={Protocol.REST}>REST</option>
                    <option value={Protocol.GRPC}>gRPC</option>
                </select>
            </div>


            {/* Map Display */}
            <div className='map-parent'>
                {/* Map Image */}
                <img alt='poland map outline' src='/poland-outline.jpg'></img>
                
                {/* Node connections */}
                <svg 
                    className="connections-layer"
                    viewBox="0 0 100 100" 
                    preserveAspectRatio="none"
                >
                    {topologyData.connections.map((connection, index) => {
                        if (!nodeActiveStates[connection.from] || !nodeActiveStates[connection.to]) {
                            return null;
                        }

                        const startNode = nodeUIList[connection.from];
                        const endNode = nodeUIList[connection.to];
                        return (
                            <line 
                                key={index}
                                x1={startNode.positionLeft} y1={startNode.positionTop} 
                                x2={endNode.positionLeft} y2={endNode.positionTop} 
                                stroke={connection.from === currentNodeSelected || connection.to === currentNodeSelected ? "black" : "rgba(0,0,0,0.25)"}
                                strokeWidth="0.2"
                                strokeDasharray="1 0.75"
                            />
                        );
                    })}
                </svg>

                {/* Node Control Panels UI*/}
                { nodeUIList && nodeUIList.length>0 ?(
                    nodeUIList.map( (nodeUIData, index) => {
                        return (
                            <NodeControlPanel
                                key={index}
                                nodeName={nodeUIData.name}
                                positionLeft={nodeUIData.positionLeft}
                                positionTop={nodeUIData.positionTop}
                                id={index}
                                isSubscribedTo={index === currentSubscriptionId}
                                onHoverChange={onNodeHoverStateChange}
                                onSubscribeToNode={onSubscribeButtonPressed}
                                onToggleNode={onToggleNode}
                            />
                        )
                    })
                    ) : (null)
                }
            </div>

            {/* Console Display */}
            <div className='console'>
                { consoleContent.map( (line) =>
                <p key={line.id} style={{color:line.error?"red":"black"}}> {line.text} </p>
                )}
            </div>

        </div>
    );
}

export default App;

