import './App.css';
import { useRef, useEffect, Ref, useState } from 'react';
import NodeControlPanel from './NodeControlPanel';
import { nodeUIList, topologyData } from './nodesUI';
import { serverApi } from './serverApiCommunication';
import { NumericLiteral } from 'typescript';

class ConsoleLine {
    id: string = "";
    text: string = "";
    aliveUntil: number = 0;
    error: boolean = false;
}

declare global {
    interface Window {
        currentSse?: EventSource;
    }
}

function App() {
    const [currentNodeSelected, setNodeSelected] = useState(-1)
    const [consoleContent, setConsoleContent] = useState<Array<ConsoleLine>>([])
    const [nodeActiveStates, setNodeActiveStates] = useState<boolean[]>(
        topologyData.devices.map(device => device.active)
    )
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
    function pushLineToConsole(text: string, error: boolean = false, displayTime: number = 1000) {
        const aliveUntil = Date.now() + displayTime * 1000;
        const id = `${Date.now()}-${consoleIdRef.current++}`
        setConsoleContent(prev => [...prev, { id, text, aliveUntil, error }]);
        return id;
    }
    function replaceConsoleLine(id: string, text: string, error: boolean = false, displayTime: number = 1000) {
        const aliveUntil = Date.now() + displayTime * 1000;
        setConsoleContent(prev => prev.map(line => line.id === id ? { ...line, text, error, aliveUntil } : line));
    }

    /* Button handlers */
    async function onSubscribeButtonPressed(nodeIndex: number) {
        const nodeName = nodeUIList[nodeIndex].name.toUpperCase();
        const pendingId = pushLineToConsole(`Subscribing to ${nodeName}...`, false, 30);

        // close previous connection
        if (window.currentSse) {
            pushLineToConsole(`Unsubscribing from previous connection`, false);
            window.currentSse.close();
        }

        // connect event source to endpoint
        const eventSource = new EventSource(`http://localhost:8080/devices/${nodeIndex}/reachable-devices`);
        window.currentSse = eventSource;

        // listen for messages from server
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
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

        // handle stream errors
        eventSource.onerror = (error) => {
            replaceConsoleLine(pendingId, `SSE Error when subscribing to ${nodeName}.`, true);
            eventSource.close();
        };
    }
    async function onToggleNode(nodeIndex: number, newState: boolean) {
        setNodeActiveStates(prev => prev.map((active, idx) => idx === nodeIndex ? newState : active))

        const nodeName = nodeUIList[nodeIndex].name.toUpperCase();
        const pendingId = pushLineToConsole(`${newState ? 'Turning on' : 'Turning off'} ${nodeName}...`, false, 30)
        
        const res = await serverApi.toggleNode(nodeIndex, newState)
        if (res.error) replaceConsoleLine(pendingId, `Error thrown when toggling ${nodeName} to ${newState?"on":"off"}: (${res.errorMsg})`, true)
        else if (res.data != null && res.data == false) replaceConsoleLine(pendingId, `Server did not Acknowledge command ${nodeName} to ${newState?"on":"off"}, now desynced`, true)
        else replaceConsoleLine(pendingId,`Node ${nodeName} has been ${newState ? 'enabled' : 'disabled'}`)
    }
    function onNodeHoverStateChange(index:number, newState: boolean) {
        setNodeSelected( newState ? index : -1 )
    }       

    return (
        <div> 
            {/* Title and credits */}
            <div id='credits'> 
                <div id='app-title'> Network Manager (Hitachi Assignment) </div>
                <p> by: <i> Dominik Matuszczyk </i> (2026) </p>
                {/* <p> *pozycje na mapie niekoniecznie odpowiadają prawdziwym </p> */}
            </div>

            {/* Map Display */}
            <div className='map-parent'>
                {/* Map Image */}
                <img src='/poland-outline.jpg'></img>
                
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
                                stroke={connection.from == currentNodeSelected || connection.to == currentNodeSelected ? "black" : "rgba(0,0,0,0.25)"}
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

