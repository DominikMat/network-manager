package com.server;

import com.server.TopologyStructure.Topology;
import tools.jackson.databind.ObjectMapper;

import java.io.File;

public class FileInputParser {

    public static Topology readTopologyFromFile(String filePath) {
        ObjectMapper mapper = new ObjectMapper();

        try {
            return mapper.readValue(new File(filePath), Topology.class);
        } catch (Exception e) {
            System.err.println("Błąd podczas czytania pliku z topologia: " + e.getMessage());
        }
        return null;
    }
}