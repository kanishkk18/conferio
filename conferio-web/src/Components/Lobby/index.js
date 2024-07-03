import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';


const RoomPage = () => {
    const { roomId } = useParams();
    const meetingRef = useRef(null);

    useEffect(() => {
        const myMeeting = async () => {
            if (!roomId) {
                console.error("Room ID is required");
                return;
            }

            try {
                const appID = 672162921;
                const serverSecret = "2ad678b71a787f13c69daa50c7c89cdc";
                const userID = Date.now().toString();  // Ensure the userID is a string
                const userName = "user";
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, userID, userName);

                console.log("Generated Kit Token:", kitToken);

                const zp = ZegoUIKitPrebuilt.create(kitToken);
                zp.joinRoom({
                    container: meetingRef.current,
                    sharedLinks: [
                        {
                            name: 'Copy Link',
                            url: `https://us05web.conferio.us/j/6258390583?pwd=TjZWTE9SeHd3Wml0MWN1UDBJeDNJUT09/room/${roomId}`,
                        }
                    ],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.GroupCall,
                        config: {}  // Add config if necessary, otherwise leave it as an empty object
                    },
                });

                console.log("Attempting to join the room...");

            } catch (error) {
                console.error("Error joining the room", error);
            }
        };

        myMeeting();
    }, [roomId]);

    return (
        <div>
            <div ref={meetingRef} style={{ width: '100%', height: '100vh' }} />
        </div>
    );
}

export default RoomPage;
