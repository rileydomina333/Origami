let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🤖 Ciao! Sono l'agente avanzato di 888-BOT.\nChiedimi qualcosa, ad esempio:\nusedPrefix{command} generami un report di vendita`);

    await conn.sendPresenceUpdate('composing', m.chat);

    try {
        await conn.sendRichMessage(m.chat, [
            { 
                messageType: 2, 
                messageText: `🤖 *AGENTE AI RICCO | ORIGAMI-BOT*\n\nHo elaborato la tua richiesta:\n"\${text}"` 
            },
            {
                messageType: 5,
                codeMetadata: {
                    codeLanguage: 'javascript',
                    codeBlocks: [
                        { 
                            highlightType: 0, 
                            codeContent: `// Log di sistema\nStatus: "Pronto"\nTimestamp: \${new Date().toLocaleTimeString()}` 
                        }
                    ]
                }
            }
        ], m);

    } catch (error) {
        await conn.sendMessage(m.chat, { 
            text: `❌ *ERRORE INTERNO*:\n\`\`\`${error.message}\`\`\`` 
        }, { quoted: m });
    }
};

handler.help = ['ai <prompt>', 'ORIGAMIai <prompt>', 'agent <prompt>'];
handler.tags = ['ai'];
handler.command = ["ai", "ORIGAMIai", "agent"];

export default handler;