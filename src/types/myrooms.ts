export interface PendingMember {
    memberId: number;
    userId: number;
    nickname: string;
}

export interface InvitedRoom {
    type: "invited";
    roomId: number;
    memberId: number;
    book: { title: string; publisher: string };
    invitedBy: string;
}

export interface LeaderRoom {
    type: "leader";
    roomId: number;
    memberId: number;
    book: { title: string; publisher: string };
    currentMembers?: number;
    atLeastPeople?: number;
    pendingMembers?: PendingMember[];
}

export interface OtherRoom {
    type: "other";
    roomId: number;
    memberId: number;
    book: { title: string; publisher: string };
    currentMembers?: number;
    atLeastPeople?: number;
    myState?: "pending" | "accepted";
    myNickname?: string;
}

export interface WaitingRoomsResponse {
    invitedRooms: InvitedRoom[];
    leaderRooms: LeaderRoom[];
    otherRooms: OtherRoom[];
}

export interface OngoingRoomsResponse {
    leaderRooms: OngoingRoom[];
    otherRooms: OngoingRoom[];
}

export interface OngoingRoom {
    type: "leader" | "other";
    roomId: number;
    memberId: number;
    currentMembers?: number;
    atLeastPeople?: number;
    book: { title: string; publisher: string };
}