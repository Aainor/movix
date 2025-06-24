document.addEventListener('DOMContentLoaded', function() {
            const chatbox = document.getElementById('chatbox');
            const chatboxButton = document.getElementById('chatbox-button');
            const chatboxClose = document.getElementById('chatbox-close');
            const chatboxBody = document.getElementById('chatbox-body');
            const chatboxInput = document.getElementById('chatbox-input');
            const chatboxSend = document.getElementById('chatbox-send');
            const notification = document.getElementById('notification');

            // Initial messages
            const initialMessages = [
                {
                    text: "¡Hola! 👋 Soy el asistente virtual de Movix Mudanzas. ¿En qué puedo ayudarte hoy?",
                    quickReplies: [
                        "Servicios",
                        "Cómo trabajamos",
                        "Contacto"
                    ]
                }
            ];

            // Services information
            const services = [
                {
                    title: "Mudanzas Residenciales",
                    description: "Embalamos cada objeto con cuidado, transportamos tus pertenencias de forma segura y descargamos todo en tu nuevo hogar."
                },
                {
                    title: "Almacenamiento temporal",
                    description: "Contamos con un depósito privado y vigilado donde cada caja se almacena sellada y etiquetada."
                },
                {
                    title: "Transporte de cargas parciales",
                    description: "También hacemos envíos pequeños y compartidos, adaptándonos a tu necesidad."
                }
            ];

            // Process information
            const process = "Primero, llená el formulario de nuestra página web. Luego coordinamos una visita para cotizar. Finalmente, realizamos la mudanza de forma rápida y segura.";

            // Contact information with WhatsApp link
            const contact = `📧 Correo electrónico: movixmudanzas@gmail.com
📱 Whatsapp: <a href="https://api.whatsapp.com/send/?phone=5491135791114&text=%C2%A1Hola%21+Quisiera+saber+m%C3%A1s+sobre+las+mudanzas.&type=phone_number&app_absent=0" class="whatsapp-link" target="_blank">11 3579-1114 (Presiona aquí)</a>`;

            // Function to add a message to the chat
            function addMessage(text, isReceived = true, hasQuickReplies = false, quickReplies = []) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${isReceived ? 'received' : 'sent'}`;
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'message-content';
                
                // Allow HTML in messages for links
                if (typeof text === 'string') {
                    contentDiv.innerHTML = text;
                } else {
                    contentDiv.textContent = text;
                }
                
                messageDiv.appendChild(contentDiv);
                
                // Add time
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                const now = new Date();
                timeDiv.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                messageDiv.appendChild(timeDiv);
                
                chatboxBody.appendChild(messageDiv);
                
                // Add quick replies if any
                if (hasQuickReplies && quickReplies.length > 0) {
                    const quickRepliesDiv = document.createElement('div');
                    quickRepliesDiv.className = 'quick-replies';
                    
                    quickReplies.forEach(reply => {
                        const replyButton = document.createElement('button');
                        replyButton.className = 'quick-reply';
                        replyButton.textContent = reply;
                        replyButton.addEventListener('click', function() {
                            addMessage(reply, false);
                            setTimeout(() => handleUserInput(reply), 500);
                            quickRepliesDiv.remove();
                        });
                        quickRepliesDiv.appendChild(replyButton);
                    });
                    
                    messageDiv.appendChild(quickRepliesDiv);
                }
                
                // Scroll to bottom
                chatboxBody.scrollTop = chatboxBody.scrollHeight;
                
                return messageDiv;
            }

            // Function to show typing indicator
            function showTypingIndicator() {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'message received';
                
                const typingContent = document.createElement('div');
                typingContent.className = 'typing-indicator';
                
                for (let i = 0; i < 3; i++) {
                    const dot = document.createElement('div');
                    dot.className = 'typing-dot';
                    typingContent.appendChild(dot);
                }
                
                typingDiv.appendChild(typingContent);
                chatboxBody.appendChild(typingDiv);
                chatboxBody.scrollTop = chatboxBody.scrollHeight;
                
                return typingDiv;
            }

            // Function to hide typing indicator
            function hideTypingIndicator(typingDiv) {
                if (typingDiv && typingDiv.parentNode) {
                    typingDiv.remove();
                }
            }

            // Function to display services
            function displayServices() {
                const servicesDiv = document.createElement('div');
                servicesDiv.className = 'message received';
                
                const servicesContent = document.createElement('div');
                servicesContent.className = 'message-content';
                servicesContent.innerHTML = '<strong>Nuestros servicios:</strong>';
                
                services.forEach(service => {
                    const card = document.createElement('div');
                    card.className = 'service-card';
                    card.innerHTML = `
                        <h4>${service.title}</h4>
                        <p>${service.description}</p>
                    `;
                    servicesContent.appendChild(card);
                });
                
                servicesDiv.appendChild(servicesContent);
                
                // Add time
                const timeDiv = document.createElement('div');
                timeDiv.className = 'message-time';
                const now = new Date();
                timeDiv.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                servicesDiv.appendChild(timeDiv);
                
                chatboxBody.appendChild(servicesDiv);
                chatboxBody.scrollTop = chatboxBody.scrollHeight;
            }

            // Function to handle user input
            function handleUserInput(input) {
                const typing = showTypingIndicator();
                
                setTimeout(() => {
                    hideTypingIndicator(typing);
                    
                    input = input.toLowerCase();
                    
                    // Handle greetings
                    if (input.includes('hola') || input.includes('buen día') || input.includes('buenas tardes') || input.includes('buenas noches')) {
                        addMessage("¡Hola! 👋 Soy el asistente virtual de Movix Mudanzas. ¿En qué puedo ayudarte hoy?", true, true, ["Servicios", "Cómo trabajamos", "Contacto"]);
                    }
                    // Handle goodbyes
                    else if (input.includes('chau') || input.includes('adiós') || input.includes('adios')) {
                        addMessage("¡Espero haberte sido de ayuda! Si necesitas algo más, no dudes en preguntar.", true, false);
                    }
                    else if (input.includes('servicio') || input === 'servicios') {
                        displayServices();
                        addMessage("¿Te gustaría saber cómo trabajamos o nuestros datos de contacto?", true, true, ["Cómo trabajamos", "Contacto"]);
                    } 
                    else if (input.includes('trabajamos') || input === 'cómo trabajamos' || input === 'como trabajamos') {
                        addMessage("Así manejamos las mudanzas:\n\n" + process);
                        addMessage("¿Quieres información sobre nuestros servicios o contacto?", true, true, ["Servicios", "Contacto"]);
                    } 
                    else if (input.includes('contacto') || input === 'contacto') {
                        addMessage("Nuestros contactos:<br><br>" + contact);
                        addMessage("¿En qué más puedo ayudarte?", true, true, ["Servicios", "Cómo trabajamos"]);
                    } 
                    else {
                        addMessage("No entendí tu consulta. Por favor selecciona una opción:", true, true, ["Servicios", "Cómo trabajamos", "Contacto"]);
                    }
                }, 1500);
            }

            // Initialize chat
            function initChat() {
                initialMessages.forEach(msg => {
                    addMessage(msg.text, true, true, msg.quickReplies);
                });
            }

            // Toggle chatbox visibility
            function toggleChatbox() {
                chatbox.classList.toggle('active');
                if (chatbox.classList.contains('active')) {
                    notification.style.display = 'none';
                }
            }

            // Event listeners
            chatboxButton.addEventListener('click', function() {
                toggleChatbox();
                if (!chatboxBody.hasChildNodes()) {
                    initChat();
                }
            });

            chatboxClose.addEventListener('click', toggleChatbox);

            chatboxSend.addEventListener('click', function() {
                const message = chatboxInput.value.trim();
                if (message) {
                    addMessage(message, false);
                    setTimeout(() => handleUserInput(message), 500);
                    chatboxInput.value = '';
                }
            });

            chatboxInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const message = chatboxInput.value.trim();
                    if (message) {
                        addMessage(message, false);
                        setTimeout(() => handleUserInput(message), 500);
                        chatboxInput.value = '';
                    }
                }
            });

            // Show notification if chat is not open
            if (!chatbox.classList.contains('active')) {
                notification.style.display = 'flex';
            }
        });