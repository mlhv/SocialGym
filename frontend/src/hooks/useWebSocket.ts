import { useEffect, useState, useRef } from "react";
// @ts-ignore
import SockJS from "sockjs-client/dist/sockjs";
// @ts-ignore
import Stomp from "stompjs";

export interface ChatMessage {
    sender: string;
    content: string;
    type: 'CHAT' | 'JOIN' | 'LEAVE';
    score : number; // Add score field to ChatMessage
    feedback: string; // Add feedback field to ChatMessage
    sentimentScore?: number; // Add sentimentScore field to ChatMessage
    id: string; // Add id field to uniquely identify messages
}

interface StompMessage {
    body: string;
    headers: Record<string, string>;
}

export const useWebSocket = (username: string) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef<Stomp.Client | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch('http://localhost:8080/history');
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        };

        fetchHistory();

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);

        client.debug = () => {}; // Disable logging

        client.connect({}, () => {
            setIsConnected(true);

            client.subscribe('/topic/public', (message: StompMessage) => {
                const incomingMsg = JSON.parse(message.body);
                
                setMessages((prevMessages) => {
                    // Check if the incoming message already exists in the state
                    const exists = incomingMsg.id && prevMessages.find(m => m.id === incomingMsg.id);

                    if (exists) {
                        // If it exists, update the existing message
                        return prevMessages.map(m => m.id === incomingMsg.id ? incomingMsg : m);
                    } else {
                        // If it doesn't exist, add it to the state
                        return [...prevMessages, incomingMsg];
                    }
                })
            });

            client.send(
                '/app/chat.addUser',
                {},
                JSON.stringify({ sender: username, type: 'JOIN' })
            );
        }, (error: unknown) => {
            console.error('WebSocket connection error:', error);
            setIsConnected(false);
        });

        stompClientRef.current = client;

        return () => {
            if (client && client.connected) {
                client.disconnect(() => {
                    console.log('WebSocket disconnected');
                });
            }
        };
    }, [username]);

    const sendMessage = (content: string, gameMode: string = 'DATING') => {
        if (stompClientRef.current && isConnected) {
            const chatMessage = {
                sender: username,
                content: content,
                type: 'CHAT',
                gameMode: gameMode, 
            };
            stompClientRef.current.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
        }
    };

    return { messages, sendMessage, isConnected };
};