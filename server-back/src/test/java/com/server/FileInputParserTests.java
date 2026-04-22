package com.server;

import com.server.TopologyStructure.Topology;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.File;
import java.io.FileWriter;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FileInputParserTests {

    @TempDir
    Path tempDir; // temporary folder

    @Test
    void shouldParseValidJsonFile() throws Exception {
        // tworzenie przykladowej topologi
        File tempFile = tempDir.resolve("test-topology.json").toFile();
        try (FileWriter writer = new FileWriter(tempFile)) {
            writer.write("""
                {
                  "devices": [
                    {"id": 0, "name": "A", "active": true},
                    {"id": 1, "name": "B", "active": true}
                  ],
                  "connections": [
                    {"from": 0, "to": 1}
                  ]
                }
            """);
        }

        Topology result = FileInputParser.readTopologyFromFile(tempFile.getAbsolutePath());

        assertNotNull(result);
        assertEquals(2, result.devices.size());
        assertEquals("A", result.devices.getFirst().name);
        assertEquals(1, result.connections.size());
    }

    @Test
    void shouldReturnNullOnInvalidFile() {
        Topology result = FileInputParser.readTopologyFromFile("imaginary-topology.json");
        assertNull(result);
    }
}