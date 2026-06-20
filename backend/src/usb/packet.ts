export const PACKET_HEADER = 0xAA;
export const PACKET_FOOTER = 0x55;
export const PROTOCOL_VERSION = 0x01;

export enum CommandId {
  ACK = 0x00,
  NACK = 0x01,
  PING = 0x02,
  GET_STATUS = 0x10,
  SET_VOLUME = 0x11,
  SET_GAIN = 0x12,
  SET_EQ = 0x13,
  APPLY_PROFILE = 0x14,
  FIRMWARE_START = 0x20,
  FIRMWARE_CHUNK = 0x21,
  FIRMWARE_END = 0x22,
  RECONNECT = 0x30,
}

export interface Packet {
  version: number;
  commandId: number;
  sequenceId: number;
  payloadLength: number;
  payload: Buffer;
  crc16: number;
}

export class Crc16 {
  static compute(buffer: Buffer): number {
    let crc = 0xFFFF;
    for (let i = 0; i < buffer.length; i++) {
      crc ^= buffer[i];
      for (let j = 0; j < 8; j++) {
        if ((crc & 1) !== 0) {
          crc = (crc >> 1) ^ 0xA001;
        } else {
          crc = crc >> 1;
        }
      }
    }
    return crc;
  }
}
