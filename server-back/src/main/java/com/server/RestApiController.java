package com.server;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.Set;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class RestApiController {

    private final NetworkManager networkManager;

    public RestApiController(NetworkManager networkManager) {
        this.networkManager = networkManager;
    }

    @PatchMapping("/devices/{id}")
    public boolean updateDevice(@PathVariable int id, @RequestBody Map<String, Boolean> body) {
        boolean active = body.get("active");
        return networkManager.toggleDeviceState(id, active);
    }

    @GetMapping(path = "/devices/{id}/reachable-devices")
    public SseEmitter streamReachableDevices(@PathVariable int id) {
        if ( !networkManager.subscribeToDevice(id) ) return null; // dont return if we already subscribed (else we do)
        return networkManager.generateInitialStateEvent(id);
    }
}