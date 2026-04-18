package com.server;

import com.server.TopologyStructure.NetworkNode;
import com.server.TopologyStructure.Topology;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

public class NetworkManager {

    private int networkSize = 0; // number of nodes in network
    private NetworkNode[] networkNodes;
    private Map<Integer, Set<Integer>> reachableNodesFromId;
    List<Integer> subscribedIds = new ArrayList<>();
    private final Map<Integer, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NetworkManager(Topology networkTopology) {
        initializeNetworkNodesBasedOnTopology(networkTopology);

        System.out.println("Initialized with network topology");
        for (int i=0; i<networkNodes.length; i++) {
            System.out.println(networkNodes[i].id + ": " + networkNodes[i].name);
            System.out.println("  Connected to: [" + Arrays.toString(networkNodes[i].neighborIds.toArray()) + "]");
            System.out.println("  Computed reachables num: " + this.reachableNodesFromId.get(i).size());
        }
    }

    /* Initialization of node structure */
    private void initializeNetworkNodesBasedOnTopology(Topology networkTopology) {
        this.networkSize = networkTopology.devices.size();
        this.networkNodes = new NetworkNode[this.networkSize];

        /* Add devices as nodes to network */
        for (int i = 0; i < this.networkSize; i++) {
            var device = networkTopology.devices.get(i);
            networkNodes[i] = new NetworkNode(device.id, device.name, device.active);
        }

        /* set connections between nodes*/
        for (var connection : networkTopology.connections) {
            networkNodes[connection.from].addConnection(connection.to);
            networkNodes[connection.to].addConnection(connection.from);
        }

        /* Initial computation of reachable nodes from all positions */
        this.reachableNodesFromId = new HashMap<>();
        for (var device : networkTopology.devices) {
            reachableNodesFromId.put(device.id, findReachableNodes(device.id));
        }
    }

    /* Network calculations */
    public Set<Integer> findReachableNodes(int startId) {
        NetworkNode startNode = networkNodes[startId];
        if (startNode == null || !startNode.active) return Collections.emptySet();

        Set<Integer> reachable = new HashSet<>();
        Queue<Integer> queue = new LinkedList<>();
        queue.add(startId);

        while (!queue.isEmpty()) {
            int currentId = queue.poll();
            for (int neighborId : networkNodes[currentId].neighborIds) {
                if (networkNodes[neighborId].active && !reachable.contains(neighborId) && neighborId != startId) {
                    reachable.add(neighborId);
                    queue.add(neighborId);
                }
            }
        }

        System.out.println("Calculated reachable nodes from " + startNode.name + " id="+startId+", count: " + reachable.size());
        return reachable;
    }

    /* Event Mangement */
    public void onUpdateNetworkStructure() {
        System.out.println("Updating network structure");
        for (int subscribedId : this.subscribedIds) {
            Set<Integer> oldState = this.reachableNodesFromId.get(subscribedId);
            Set<Integer> newState = findReachableNodes(subscribedId);

            Set<Integer> added = new HashSet<>(newState);
            added.removeAll(oldState);

            Set<Integer> removed = new HashSet<>(oldState);
            removed.removeAll(newState);

            if (!added.isEmpty() || !removed.isEmpty()) {
                sendEvents(subscribedId, added, removed);
                this.reachableNodesFromId.replace(subscribedId,newState);
            }
        }
    }
    public record NetworkEvent(String type, Object data) {}
    private void sendEvents(int subscribedId, Set<Integer> added, Set<Integer> removed) {
        List<SseEmitter> nodeEmitters = emitters.get(subscribedId);
        if (nodeEmitters == null) return;

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : nodeEmitters) {
            try {
                for (Integer id : added) {
                    emitter.send(SseEmitter.event().data(Map.of("type", "ADDED", "deviceId", id)));
                }
                for (Integer id : removed) {
                    emitter.send(SseEmitter.event().data(Map.of("type", "REMOVED", "deviceId", id)));
                }
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }
        nodeEmitters.removeAll(deadEmitters);
    }
    public SseEmitter generateInitialStateEvent(int id) {
        if (!validDeviceId(id)) return null;

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        this.emitters.computeIfAbsent(id, k -> new CopyOnWriteArrayList<>()).add(emitter);

        try {
            Set<Integer> initialNodes = findReachableNodes(id);
            Map<String, Object> event = Map.of(
                    "type", "INITIAL_STATE",
                    "deviceIds", initialNodes
            );
            emitter.send(SseEmitter.event().data(event));
            this.reachableNodesFromId.put(id, initialNodes);

        } catch (IOException e) {
            emitter.complete();
        }

        emitter.onCompletion(() -> emitters.get(id).remove(emitter));
        emitter.onTimeout(() -> emitters.get(id).remove(emitter));

        return emitter;
    }

    /* Api Endpoint Implementations */
    public boolean toggleDeviceState(int id, boolean newState) {
        if ( !validDeviceId(id) || this.networkNodes[id].active == newState) return false;
        this.networkNodes[id].setActive(newState);
        onUpdateNetworkStructure();
        return true;
    }
    public boolean subscribeToDevice(int id) {
        if ( !validDeviceId(id) || this.subscribedIds.contains(id)) return false;
        this.subscribedIds.add(id);
        return true;
    }

    /* Helper function to validate ids of network devices */
    private boolean validDeviceId(int id) {
        if (id < 0 || id >= this.networkSize || this.networkNodes[id] == null) {
            System.err.println("Cannot turn off device! Invalid id: " + id);
            return false;
        }
        return true;
    }
}
