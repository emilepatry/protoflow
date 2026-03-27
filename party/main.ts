import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

export default class ProtoflowServer implements Party.Server {
  constructor(public room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    return onConnect(conn, this.room, {
      persist: { mode: "snapshot" },
    });
  }
}

ProtoflowServer satisfies Party.Worker;
