import * as jspb from 'google-protobuf'



export class SubscribeRequest extends jspb.Message {
  getDeviceId(): number;
  setDeviceId(value: number): SubscribeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscribeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubscribeRequest): SubscribeRequest.AsObject;
  static serializeBinaryToWriter(message: SubscribeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscribeRequest;
  static deserializeBinaryFromReader(message: SubscribeRequest, reader: jspb.BinaryReader): SubscribeRequest;
}

export namespace SubscribeRequest {
  export type AsObject = {
    deviceId: number,
  }
}

export class NetworkEvent extends jspb.Message {
  getType(): string;
  setType(value: string): NetworkEvent;

  getDeviceIdsList(): Array<number>;
  setDeviceIdsList(value: Array<number>): NetworkEvent;
  clearDeviceIdsList(): NetworkEvent;
  addDeviceIds(value: number, index?: number): NetworkEvent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NetworkEvent.AsObject;
  static toObject(includeInstance: boolean, msg: NetworkEvent): NetworkEvent.AsObject;
  static serializeBinaryToWriter(message: NetworkEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NetworkEvent;
  static deserializeBinaryFromReader(message: NetworkEvent, reader: jspb.BinaryReader): NetworkEvent;
}

export namespace NetworkEvent {
  export type AsObject = {
    type: string,
    deviceIdsList: Array<number>,
  }
}

export class ToggleRequest extends jspb.Message {
  getDeviceId(): number;
  setDeviceId(value: number): ToggleRequest;

  getActive(): boolean;
  setActive(value: boolean): ToggleRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToggleRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ToggleRequest): ToggleRequest.AsObject;
  static serializeBinaryToWriter(message: ToggleRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToggleRequest;
  static deserializeBinaryFromReader(message: ToggleRequest, reader: jspb.BinaryReader): ToggleRequest;
}

export namespace ToggleRequest {
  export type AsObject = {
    deviceId: number,
    active: boolean,
  }
}

export class ToggleResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): ToggleResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ToggleResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ToggleResponse): ToggleResponse.AsObject;
  static serializeBinaryToWriter(message: ToggleResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ToggleResponse;
  static deserializeBinaryFromReader(message: ToggleResponse, reader: jspb.BinaryReader): ToggleResponse;
}

export namespace ToggleResponse {
  export type AsObject = {
    success: boolean,
  }
}

