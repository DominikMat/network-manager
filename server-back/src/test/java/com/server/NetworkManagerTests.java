package com.server;

import com.server.TopologyStructure.Connection;
import com.server.TopologyStructure.Device;
import com.server.TopologyStructure.Topology;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class NetworkManagerTests {

	private NetworkManager manager;

	@BeforeEach
	void setUp() { // tworzenie przykladowej topologii
		Topology t = new Topology();

		Device d0 = new Device(); d0.id = 0; d0.name = "Warszawa"; d0.active = true;
		Device d1 = new Device(); d1.id = 1; d1.name = "Krakow"; d1.active = true;
		Device d2 = new Device(); d2.id = 2; d2.name = "Wroclaw"; d2.active = true;
		t.devices = List.of(d0, d1, d2);

		Connection c1 = new Connection(); c1.from = 0; c1.to = 1;
		Connection c2 = new Connection(); c2.from = 1; c2.to = 2;
		t.connections = List.of(c1, c2);

		manager = new NetworkManager(t);
	}

	@Test
	void findReachableNodes_shouldReturnAllConnectedNodes() {
		// Jeśli zapytamy o Node 0 (Warszawa) powinien widzieć Kraków(1) i Wrocław(2)
		Set<Integer> reachable = manager.findReachableNodes(0);

		assertEquals(2, reachable.size());
		assertTrue(reachable.containsAll(Set.of(1, 2)));
	}

	@Test
	void toggleDeviceState_shouldAffectReachability() {
		// Wyłączamy node (Kraków - 1)
		manager.toggleDeviceState(1, false);

		// Teraz Node 0 (Warszawa) nic nie widzi (Kraków jest wyłączony, a przez niego szła droga do Wrocławia)
		Set<Integer> reachableFrom0 = manager.findReachableNodes(0);
		assertTrue(reachableFrom0.isEmpty());

		// Node 2 (Wrocław) tez nie widzi
		Set<Integer> reachableFrom2 = manager.findReachableNodes(2);
		assertTrue(reachableFrom2.isEmpty());
	}
}