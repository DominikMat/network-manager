package com.server;

import com.server.TopologyStructure.NetworkNode;
import com.server.TopologyStructure.Topology;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class NetworkManager {

    private int networkSize = 0; // number of nodes in network
    private NetworkNode[] networkNodes;
    private Map<Integer, Set<Integer>> reachableNodesFromId;
    List<Integer> subscribedIds = new ArrayList<>();
    private final Map<Integer, Sinks.Many<NodeUpdateEvent>> sinks = new ConcurrentHashMap<>();

    public NetworkManager(Topology networkTopology) {
        initializeNetworkNodesBasedOnTopology(networkTopology);

        System.out.println("Initialized with network topology");
        for (NetworkNode networkNode : networkNodes) {
            System.out.println(networkNode.id + ": " + networkNode.name);
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
    }

    /* Network calculations */
    public void onUpdateNetworkStructure() {
        System.out.println("Updating network structure");

        // go thru subscribed IDs and calculate reachable nodes - check for differences with cached nodes
        for (int subscribedId : this.subscribedIds) {
            // get reachable nodes before and now
            Set<Integer> oldState = this.reachableNodesFromId.get(subscribedId);
            Set<Integer> newState = findReachableNodes(subscribedId);

            // calculate the change in nodes, send update event
            Set<Integer> added = new HashSet<>(newState);
            added.removeAll(oldState);
            Set<Integer> removed = new HashSet<>(oldState);
            removed.removeAll(newState);

            if (!added.isEmpty() || !removed.isEmpty()) { // if there is change
                sendEvents(subscribedId, added, removed);
                this.reachableNodesFromId.replace(subscribedId,newState); // update cache
            }
        }
    }
    public Set<Integer> findReachableNodes(int startId) { // simple bfs implementation (adapted from https://www.javaspring.net/blog/bfs-search-java/ )
        NetworkNode startNode = networkNodes[startId];
        if (startNode == null || !startNode.active) return Collections.emptySet();

        Set<Integer> reachable = new HashSet<>();
        boolean[] visited = new boolean[this.networkSize];
        LinkedList<Integer> queue = new LinkedList<>();

        visited[startId] = true;
        queue.add(startId);

        while (!queue.isEmpty()) {
            int currentId = queue.poll();

            for (int neighborId : networkNodes[currentId].neighborIds) {
                if (networkNodes[neighborId].active && !visited[neighborId]) {
                    visited[neighborId] = true;
                    reachable.add(neighborId);
                    queue.add(neighborId);
                }
            }
        }

        System.out.println("Calculated reachable nodes from " + startNode.name + " id="+startId+", count: " + reachable.size());
        return reachable;
    }

    /* Event Mangement */
    public record NodeUpdateEvent(String type, Set<Integer> deviceIds) {}
    private void sendEvents(int subscribedId, Set<Integer> added, Set<Integer> removed) {
        Sinks.Many<NodeUpdateEvent> sink = sinks.get(subscribedId);
        if (sink == null) return;
        System.out.println("Sending User Update event for node: " + this.networkNodes[subscribedId].name + " id=" + subscribedId);

        // added nodes event
        if (added != null && !added.isEmpty()) {
            sink.tryEmitNext(new NodeUpdateEvent("ADDED", added));
            System.out.println("  Added " + added.size() + " nodes");
        } else System.out.println("  Added 0 nodes");

        // removed nodes event
        if (removed != null && !removed.isEmpty()) {
            sink.tryEmitNext(new NodeUpdateEvent("REMOVED", removed));
            System.out.println("  Removed " + removed.size() + " nodes");
        } else System.out.println("  Removed 0 nodes");
    }
    public Flux<NodeUpdateEvent> createSubscription(int id) {
        if ( isInvalidDeviceId(id)) return Flux.empty();

        // check if we have subbed in the past (if so remove old sink)
        if ( this.sinks.containsKey(id)) this.sinks.remove(id);

        // add id to subscription list
        if ( !this.subscribedIds.contains(id) ) this.subscribedIds.add(id);

        // add to subs and compute reachables
        Set<Integer> reachableFromID = findReachableNodes(id);
        this.reachableNodesFromId.put(id, reachableFromID);
        System.out.println("Subscribed to event stream from node " + this.networkNodes[id].name + " id=" + id);

        // create Flux sink
        Sinks.Many<NodeUpdateEvent> sink = sinks.computeIfAbsent(id,
            k -> Sinks.many().multicast().onBackpressureBuffer());

        // send initial state event and return flux
        var initialStateEvent = new NodeUpdateEvent("INITIAL_STATE", reachableFromID);
        return Flux.concat( Flux.just(initialStateEvent), sink.asFlux() ); // return initial state event coupled with flux
    }

    /* Api Endpoint implementation for Turning devices on and off */
    public boolean toggleDeviceState(int id, boolean newState) {
        if ( isInvalidDeviceId(id) || this.networkNodes[id].active == newState) return false;
        this.networkNodes[id].setActive(newState);
        System.out.println("Toggled node " + this.networkNodes[id].name + " id=" + id + " to state " + (newState ? "ON" : "OFF"));
        onUpdateNetworkStructure();
        return true;
    }

    /* Helper function to validate ids of network devices */
    private boolean isInvalidDeviceId(int id) {
        if (id < 0 || id >= this.networkSize || this.networkNodes[id] == null) {
            System.err.println("Cannot turn off device! Invalid id: " + id);
            return true;
        }
        return false;
    }
}
