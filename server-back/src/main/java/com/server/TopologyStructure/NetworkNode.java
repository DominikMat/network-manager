package com.server.TopologyStructure;

import java.util.HashSet;
import java.util.Set;

public class NetworkNode {
    public String name;
    public int id;
    public boolean active;
    public Set<Integer> neighborIds = new HashSet<>();

    public NetworkNode(int id, String name, boolean active) {
        this.id = id;
        this.name = name;
        this.active = active;
    }

    public void addConnection(int otherId) {
        this.neighborIds.add(otherId);
    }
    public void setActive(boolean active) {
        this.active = active;
    }
}
