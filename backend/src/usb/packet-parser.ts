import { Transform, TransformCallback } from 'stream';
import { PACKET_HEADER, PACKET_FOOTER, PROTOCOL_VERSION, Packet, Crc16 } from './packet';

export class PacketParser extends Transform {
  private buffer: Buffer = Buffer.alloc(0);

  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk: Buffer, encoding: string, callback: TransformCallback): void {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    this.processBuffer();
    callback();
  }

  private processBuffer() {
    // A complete packet is at least 10 bytes:
    // Header(1) + Version(1) + Cmd(1) + Seq(2) + Len(2) + CRC(2) + Footer(1)
    while (this.buffer.length >= 10) {
      // Find the next header
      const headerIndex = this.buffer.indexOf(PACKET_HEADER);
      if (headerIndex === -1) {
        // No header found, discard everything
        this.buffer = Buffer.alloc(0);
        return;
      }

      if (headerIndex > 0) {
        // Discard junk before header
        this.buffer = this.buffer.subarray(headerIndex);
        if (this.buffer.length < 10) return; // Need more data after slicing
      }

      const payloadLength = this.buffer.readUInt16LE(5);
      const expectedPacketSize = 10 + payloadLength;

      if (this.buffer.length < expectedPacketSize) {
        // Wait for more data
        return;
      }

      const footerIndex = expectedPacketSize - 1;
      const footer = this.buffer[footerIndex];

      if (footer !== PACKET_FOOTER) {
        // Invalid packet, drop the header and try again
        this.buffer = this.buffer.subarray(1);
        continue;
      }

      // We have a structurally valid packet size, check CRC
      // CRC is computed over: Version(1), Cmd(1), Seq(2), Len(2), Payload(N)
      // Bytes 1 to 7+N
      const crcBuffer = this.buffer.subarray(1, 7 + payloadLength);
      const expectedCrc = this.buffer.readUInt16LE(7 + payloadLength);
      const actualCrc = Crc16.compute(crcBuffer);

      if (expectedCrc !== actualCrc) {
        // CRC mismatch, log error, discard header and try again
        console.warn(`[PacketParser] CRC mismatch! Expected 0x${expectedCrc.toString(16)}, got 0x${actualCrc.toString(16)}`);
        this.buffer = this.buffer.subarray(1);
        continue;
      }

      // Valid packet!
      const packet: Packet = {
        version: this.buffer[1],
        commandId: this.buffer[2],
        sequenceId: this.buffer.readUInt16LE(3),
        payloadLength: payloadLength,
        payload: Buffer.from(this.buffer.subarray(7, 7 + payloadLength)), // copy
        crc16: expectedCrc,
      };

      this.push(packet);

      // Advance buffer past this packet
      this.buffer = this.buffer.subarray(expectedPacketSize);
    }
  }
}

export class PacketSerializer {
  static serialize(commandId: number, sequenceId: number, payload: Buffer = Buffer.alloc(0)): Buffer {
    const packetSize = 10 + payload.length;
    const buf = Buffer.alloc(packetSize);

    buf.writeUInt8(PACKET_HEADER, 0);
    buf.writeUInt8(PROTOCOL_VERSION, 1);
    buf.writeUInt8(commandId, 2);
    buf.writeUInt16LE(sequenceId, 3);
    buf.writeUInt16LE(payload.length, 5);
    
    if (payload.length > 0) {
      payload.copy(buf, 7);
    }

    const crcBuffer = buf.subarray(1, 7 + payload.length);
    const crc = Crc16.compute(crcBuffer);

    buf.writeUInt16LE(crc, 7 + payload.length);
    buf.writeUInt8(PACKET_FOOTER, 9 + payload.length);

    return buf;
  }
}
