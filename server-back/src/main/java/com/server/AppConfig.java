package com.server;

import com.server.TopologyStructure.Topology;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    /* create dependency for spring boot app */
    @Bean
    public NetworkManager networkManager() {
        /* create network manager object with topology data from input file*/
        Topology topology = FileInputParser.readTopologyFromFile("topology.json");
        if (topology == null) throw new RuntimeException("Parser topologii zwrocil pusty obiekt");
        return new NetworkManager(topology);
    }
}