package com.server.grpc;

import com.server.NetworkManager;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

@GrpcService
public class GrpcTopologyService extends TopologyServiceGrpc.TopologyServiceImplBase {

    @Autowired
    private NetworkManager networkManager;

    @Override
    public void toggleDevice(ToggleRequest request, StreamObserver<ToggleResponse> responseObserver) {
        boolean success = networkManager.toggleDeviceState(request.getDeviceId(), request.getActive());

        ToggleResponse response = ToggleResponse.newBuilder()
                .setSuccess(success)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void subscribeToDevice(SubscribeRequest request, StreamObserver<NetworkEvent> responseObserver) {
        networkManager.createSubscription(request.getDeviceId())
                .subscribe(event -> {
                            NetworkEvent grpcEvent = NetworkEvent.newBuilder()
                                    .setType(event.type())
                                    .addAllDeviceIds(event.deviceIds())
                                    .build();
                            responseObserver.onNext(grpcEvent);
                        },
                        error -> responseObserver.onError(error),
                        () -> responseObserver.onCompleted());
    }
}