// ==UserScript==
// @name         PickMe
// @namespace    http://tampermonkey.net/
// @version      1.14.1
// @description  Outils pour les membres du discord AVFR
// @author       Code : MegaMan, testeurs : Louise et Ashemka (avec également du code de lelouch_di_britannia, FMaz008 et Thorvarium)
// @match        https://www.amazon.fr/vine/vine-items
// @match        https://www.amazon.fr/vine/vine-items?queue=*
// @match        https://www.amazon.fr/vine/vine-reviews*
// @match        https://www.amazon.fr/vine/orders*
// @match        https://www.amazon.fr/vine/account
// @match        https://www.amazon.fr/vine/resources
// @match        https://www.amazon.fr/*
// @match        https://pickme.alwaysdata.net/*
// @exclude      https://www.amazon.fr/vine/vine-items?search=*
// @icon         https://pickme.alwaysdata.net/img/PM-ICO-2.png
// @updateURL    https://raw.githubusercontent.com/teitong/pickme/main/PickMe.user.js
// @downloadURL  https://raw.githubusercontent.com/teitong/pickme/main/PickMe.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_listValues
// @run-at       document-start
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// ==/UserScript==

/*
NOTES:
* Votre clé API est lié à votre compte Discord
*/

(function() {
    'use strict';

    //URL Vine
    const urlPattern = /^https:\/\/www\.amazon\.fr\/vine/;

    //Liste des URLs Vine
    const excludedPatterns = [
        'https://www.amazon.fr/vine/vine-items',
        'https://www.amazon.fr/vine/vine-items?queue=*',
        'https://www.amazon.fr/vine/vine-reviews*',
        'https://www.amazon.fr/vine/orders*',
        'https://www.amazon.fr/vine/account',
        'https://www.amazon.fr/vine/resources'
    ];

    // Fonction pour extraire l'ASIN
    function getASINfromURL(url) {
        // Expression régulière pour trouver l'ASIN dans différentes structures d'URL Amazon
        const regex = /\/(dp|gp\/product|product-reviews|gp\/aw\/d)\/([A-Za-z0-9]{10})/i;
        const match = url.match(regex);
        return match ? match[2] : null; // Retourne l'ASIN ou null si non trouvé
    }

    function isAffiliateTagPresent() {
        return window.location.search.indexOf('tag=monsieurconso-21') > -1;
    }

    //Ajout du bouton
    function addButton(asin) {
        if (!document.querySelector('#pickme-button')) {
            var priceContainer = document.querySelector('.basisPriceLegalMessage');
            if (priceContainer) {
                const affiliateButton = createButton(asin);
                // Insérez le nouveau bouton dans le DOM juste après le conteneur de prix
                priceContainer.parentNode.insertBefore(affiliateButton, priceContainer.nextSibling);
            } else {
                //priceContainer = document.querySelectorAll('snsPriceRow');
                //Selecteur du prix desktop ou mobile
                var priceContainerVar = document.getElementById('corePrice_desktop');
                if (!priceContainerVar) {
                    priceContainerVar = document.getElementById('corePrice_mobile_feature_div');
                    //Gestion pour les livres
                    if (!priceContainerVar) {
                        priceContainer = document.getElementById("bookDescription_feature_div");
                        if (priceContainer) {
                            const affiliateButton = createButton(asin);
                            priceContainer.parentNode.insertBefore(affiliateButton, priceContainer);
                        }
                    }
                } else {
                    priceContainer = priceContainerVar.querySelector('.a-span12');
                    if (priceContainer) {
                        const affiliateButton = createButton(asin);
                        //priceContainer.parentNode.insertAdjacentElement('afterend', affiliateButton);
                        priceContainer.parentNode.insertAdjacentElement('beforeend', affiliateButton);
                    }
                }
            }
        }
    }

    function submitPost(asin) {
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://pickme.alwaysdata.net/monsieurconso/top.php';
        form.target = '_blank';

        var asinField = document.createElement('input');
        asinField.type = 'hidden';
        asinField.name = 'asin';
        asinField.value = asin;

        form.appendChild(asinField);

        document.body.appendChild(form);
        form.submit();
    }

    function createButton(asin) {
        var container = document.createElement('div'); // Créer un conteneur pour le bouton et le texte d'explication
        container.style.display = 'inline-flex';
        container.style.alignItems = 'center';

        var affiliateButton = document.createElement('a');
        affiliateButton.className = 'a-button a-button-primary a-button-small';
        affiliateButton.id = 'pickme-button';
        affiliateButton.style.marginTop = '5px'; // Pour ajouter un peu d'espace au-dessus du bouton
        affiliateButton.style.marginBottom = '5px';
        affiliateButton.style.color = 'white'; // Changez la couleur du texte en noir
        //affiliateButton.style.maxWidth = '200px';
        affiliateButton.style.height = '29px';
        affiliateButton.style.lineHeight = '29px';
        affiliateButton.style.borderRadius = '20px';
        affiliateButton.style.whiteSpace = 'nowrap';
        affiliateButton.style.padding = '0 40px';
        affiliateButton.style.backgroundColor = '#CC0033';
        affiliateButton.style.border = '1px solid white';
        affiliateButton.style.display = 'inline-block';

        if (isAffiliateTagPresent()) {
            affiliateButton.innerText = 'Lien PickMe actif';
            affiliateButton.style.backgroundColor = 'green'; // Changez la couleur de fond en vert
            affiliateButton.style.color = 'white';
            affiliateButton.style.pointerEvents = 'none'; // Empêchez tout événement de clic
            affiliateButton.style.cursor = 'default';
            affiliateButton.style.border = '1px solid black';
            container.appendChild(affiliateButton); // Ajouter le bouton et le texte d'explication au conteneur
        } else {
            /*affiliateButton.onclick = function() {
                submitPost(asin);
            };*/
            affiliateButton.href = `https://pickme.alwaysdata.net/monsieurconso/product.php?asin=${asin}`;
            affiliateButton.innerText = 'Acheter via PickMe';
            affiliateButton.target = '_blank';
            var infoText = document.createElement('span'); // Créer l'élément de texte d'explication
            infoText.innerHTML = '<b>A quoi sert ce bouton ?</b>';
            infoText.style.marginLeft = '5px';
            infoText.style.color = '#CC0033';
            infoText.style.cursor = 'pointer';
            infoText.style.fontSize = '14px';
            infoText.onclick = function() {
                alert("Ce bouton permet de soutenir le discord Amazon Vine FR. Il n'y a strictement aucune conséquence sur votre achat, mise à part d'aider à maintenir les services du discord et de PickMe.\n\nComment faire ?\n\nIl suffit de cliquer sur 'Acheter via PickMe' et dans la nouvelle fenêtre de cliquer sur 'Acheter sur Amazon'. Normalement le bouton sera devenu vert, il suffit alors d'ajouter le produit au panier (uniquement quand le bouton est vert) et c'est tout !\nMerci beaucoup !");
            };
            container.appendChild(affiliateButton); // Ajouter le bouton et le texte d'explication au conteneur
            container.appendChild(infoText);
        }
        affiliateButton.style.fontSize = '14px';
        return container; // Retourner le conteneur au lieu du bouton seul
    }

    //Détermine si on ajoute l'onglet Notifications
    var pageProduit = false;
    var asinProduct = getASINfromURL(window.location.href);
    function asinReady() {
        if (asinProduct) {
            pageProduit = true;
            addButton(asinProduct);
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        asinProduct = getASINfromURL(window.location.href);
                        addButton(asinProduct);
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
            return;
        }
    }

    //Fix iPhone
    if (document.readyState !== 'loading') {
        asinReady();
    }
    else {
        document.addEventListener('DOMContentLoaded', function () {
            asinReady();
        });
    }

    //Notif
    //On initialise les variables utiles pour cette partie du script
    let notifEnabled = GM_getValue("notifEnabled", false);
    let onMobile = GM_getValue("onMobile", false);
    let shortcutNotif = GM_getValue("shortcutNotif", false);
    let callUrl = GM_getValue("callUrl", "");
    var apiKey = GM_getValue("apiToken", false);
    let notifUp = GM_getValue('notifUp', true);
    let notifRecos = GM_getValue('notifRecos', false);
    let notifPartageAFA = GM_getValue('notifPartageAFA', true);
    let notifPartageAI = GM_getValue('notifPartageAI', false);
    let notifAutres = GM_getValue('notifAutres', true);
    let notifSound = GM_getValue('notifSound', true);
    let notifFav = GM_getValue('notifFav', false);
    let favWords = GM_getValue('favWords', '');
    let hideWords = GM_getValue('hideWords', '');
    let filterOption = GM_getValue('filterOption', 'notifFavOnly');
    let hideEnabled = GM_getValue("hideEnabled", true);
    let savedTheme = GM_getValue('selectedTheme', 'default');
    GM_setValue("notifEnabled", notifEnabled);
    GM_setValue("onMobile", onMobile);
    GM_setValue("shortcutNotif", shortcutNotif);
    GM_setValue("callUrl", callUrl);
    GM_setValue("notifUp", notifUp);
    GM_setValue("notifRecos", notifRecos);
    GM_setValue("notifPartageAFA", notifPartageAFA);
    GM_setValue("notifPartageAI", notifPartageAI);
    GM_setValue("notifAutres", notifAutres);
    GM_setValue("notifSound", notifSound);
    GM_setValue("notifFav", notifFav);
    GM_setValue("favWords", favWords);
    GM_setValue("hideWords", hideWords);
    GM_setValue("filterOption", filterOption);
    GM_setValue("hideEnabled", hideEnabled);
    GM_setValue("selectedTheme", savedTheme);

    //Convertir la date SQL en date lisible européenne
    function convertToEuropeanDate(mysqlDate) {
        if (!mysqlDate) return '';

        const date = new Date(mysqlDate);
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2); // Les mois commencent à 0 en JavaScript
        const year = date.getFullYear();
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    //Récupérer les infos d'un produit dans l'API
    function infoProduct(asin) {
        const formData = new URLSearchParams({
            version: GM_info.script.version,
            token: apiKey,
            asin: asin,
        });

        return fetch("https://pickme.alwaysdata.net/shyrka/infoasin", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData.toString()
        })
            .then(response => {
            if (response.status === 200) {
                return response.json().then(data => {
                    const { date_last, title, linkText, linkUrl, main_image } = data;
                    const date_last_eu = convertToEuropeanDate(date_last);
                    return { date_last_eu, title, linkText, linkUrl, main_image };
                }).catch(error => {
                    console.error("Erreur lors de l'analyse de la réponse JSON:", error);
                    throw new Error("Erreur lors de l'analyse de la réponse JSON");
                });
            } else if (response.status === 201) {
                return response.text();
            } else {
                console.error("Erreur HTTP:", response.status, response.statusText);
                throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
            }
        })
            .catch(error => {
            console.error("Erreur de requête:", error);
            throw error;
        });
    }

    //Fonction pour demander la permission et afficher la notification
    function requestNotification(title, text, icon, queue = null, page = null) {
        if (!("Notification" in window)) {
            console.log("Ce navigateur ne supporte pas les notifications de bureau.");
            return;
        }
        if (Notification.permission === "granted") {
            if (onMobile) {
                navigator.serviceWorker.getRegistration().then(function(reg) {
                    if (reg) {
                        reg.showNotification(title, {
                            body: text || "",
                            icon: icon,
                            data: { queue: queue, page : page }
                        });
                    }
                });
            } else {
                showNotification(title, text, icon, queue, page);
            }
            soundNotif();
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    if (onMobile) {
                        navigator.serviceWorker.getRegistration().then(function(reg) {
                            if (reg) {
                                reg.showNotification(title, {
                                    body: text || "",
                                    icon: icon,
                                    data: { queue: queue, page : page }
                                });
                            }
                        });
                    } else {
                        showNotification(title, text, icon, queue, page);
                    }
                    soundNotif();
                }
            });
        }
    }

    function soundNotif() {
        if (notifSound) {
            var sound = new Audio('https://pickme.alwaysdata.net/sw/notif3.mp3');
            if (/\.mp3$/i.test(callUrl)) {
                sound = new Audio(callUrl);
            }
            sound.play();
        }
    }

    //Fonction pour afficher la notification sur PC
    function showNotification(title, text, icon, queue = null, page = null) {
        var notification = new Notification(title, {
            body: text || "",
            icon: icon
        });

        notification.onclick = function () {
            window.focus(); // Focus le navigateur quand on clique sur la notification
            var baseUrl = "https://www.amazon.fr/vine/vine-items";
            var url = baseUrl; // Initialisation de l'URL de base

            // Déterminer l'URL en fonction de la queue
            if (queue === "0") {
                url = baseUrl + "?queue=last_chance" + (page ? "&pn=&cn=&page=" + page : "");
            } else if (queue === "1") {
                url = baseUrl + "?queue=encore" + (page ? "&pn=&cn=&page=" + page : "");
            } else if (queue === "2") {
                url = baseUrl + "?queue=potluck" + (page ? "&pn=&cn=&page=" + page : "");
            } else {
                url = baseUrl + "?queue=encore" + (queue ? "&pn=" + queue : "") + (page ? "&cn=&page=" + page : "");
            }

            // Ouvrir l'URL dans un nouvel onglet
            window.open(url, '_blank');
        };
    }

    //Ecoute des messages entrants
    if (notifEnabled && apiKey) {
        var lastNotifId = null;
        if (notifFav) {
            var titleContentLower;
            if (filterOption == "notifFavOnly") {
                var favWordsTrimNotif = favWords.trim();
                var favArrayNotif = favWordsTrimNotif.length > 0
                ? favWordsTrimNotif.split(',').map(pattern => {
                    pattern = pattern.trim();
                    if (pattern.length > 0) {
                        try {
                            return new RegExp(pattern, 'i');
                        } catch (e) {
                            console.error('Expression regex invalide :', pattern, e);
                            return null;
                        }
                    } else {
                        return null;
                    }
                }).filter(regex => regex != null)
                : [];

            } else if (filterOption == "notifExcludeHidden") {
                var hiddenWordsTrimNotif = hideWords.trim();
                var hiddenArrayNotif = hiddenWordsTrimNotif.length > 0
                ? hiddenWordsTrimNotif.split(',').map(pattern => {
                    pattern = pattern.trim();
                    if (pattern.length > 0) {
                        try {
                            return new RegExp(pattern, 'i');
                        } catch (e) {
                            console.error('Expression regex invalide :', pattern, e);
                            return null;
                        }
                    } else {
                        return null;
                    }
                }).filter(regex => regex != null)
                : [];
            }
        }
        // Écouter les messages immédiatement
        window.addEventListener('message', function(event) {
            //console.log("PickMe :", event);
            lastNotifId = GM_getValue('lastNotifId', null);
            if (event.data.type === 'NEW_MESSAGE' && event.origin == "https://pickme.alwaysdata.net" && event.data.id != lastNotifId) {
                lastNotifId = event.data.id;
                GM_setValue('lastNotifId', lastNotifId);
                if ((event.data.info.toUpperCase() === "UP" && notifUp) ||
                    (event.data.info.toUpperCase() === "RECO" && notifRecos) ||
                    (event.data.info.toUpperCase() === "PRODUCT_AFA" && notifPartageAFA) ||
                    (event.data.info.toUpperCase() === "PRODUCT_AI" && notifPartageAI) ||
                    (event.data.info.toUpperCase() === "AUTRES" && notifAutres)) {
                    if (notifFav && event.data.info.toUpperCase() === "PRODUCT_AI") {
                        titleContentLower = event.data.description.toLowerCase().trim().replace(/\s+/g, '');
                        if (filterOption == "notifFavOnly") {
                            if (favArrayNotif.length > 0 && favArrayNotif.some(regex => regex.test(titleContentLower))) {
                                requestNotification(event.data.title, event.data.description, event.data.imageUrl, event.data.queue, event.data.page);
                            }
                        } else if (filterOption == "notifExcludeHidden") {
                            if (hiddenArrayNotif.length > 0 && !hiddenArrayNotif.some(regex => regex.test(titleContentLower))) {
                                requestNotification(event.data.title, event.data.description, event.data.imageUrl, event.data.queue, event.data.page);
                            }
                        }
                    } else {
                        requestNotification(event.data.title, event.data.description, event.data.imageUrl, event.data.queue, event.data.page);
                    }
                }
            }
        });

        function addNotifTab() {
            if (window.location.hostname !== "pickme.alwaysdata.net") {
                // Initialisation de l'iframe seulement si on est sur le bon domaine
                var iframe = document.createElement('iframe');
                iframe.style.display = 'none'; // Rendre l'iframe invisible
                iframe.src = "https://pickme.alwaysdata.net/sw/websocket.php?key=" + encodeURIComponent(apiKey);
                document.body.appendChild(iframe);
            } else {
                document.cookie = "pm_apiKey=" + encodeURIComponent(apiKey) + "; path=/; secure";
            }
            if (shortcutNotif && !pageProduit && window.location.href.indexOf("vine") !== -1) {
                // Sélectionner le conteneur des onglets
                var tabsContainer = document.querySelector('.a-tabs');

                // Créer le nouvel onglet pour Notifications
                var newTab1 = document.createElement('li');
                newTab1.className = 'a-tab-heading';
                newTab1.role = 'presentation';

                // Créer le lien à ajouter dans le nouvel onglet Notifications
                var link1 = document.createElement('a');
                link1.href = "https://pickme.alwaysdata.net/sw/notification.php?key=" + encodeURIComponent(apiKey);
                link1.role = 'tab';
                link1.setAttribute('aria-selected', 'false');
                link1.tabIndex = -1;
                link1.textContent = 'Notifications';
                link1.target = '_blank';
                link1.style.color = '#f8a103';
                link1.style.backgroundColor = 'transparent';
                link1.style.border = 'none';

                // Ajouter le lien au nouvel onglet Notifications
                newTab1.appendChild(link1);

                // Ajouter les nouveaux onglets au conteneur des onglets
                if (tabsContainer) {
                    tabsContainer.appendChild(newTab1);
                }
            }
        }

        //Fix iPhone
        if (document.readyState !== 'loading') {
            addNotifTab();
        }
        else {
            document.addEventListener('DOMContentLoaded', function () {
                addNotifTab()
            });
        }
    }

    // Fonction pour charger le fichier CSS
    function loadCSS(url) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    //URL des CSS
    var baseURLCSS = 'https://pickme.alwaysdata.net/';

    //Gestion des favoris sur PickMe Web
    if (window.location.hostname === "pickme.alwaysdata.net" && /^\/[^\/]+\.php$/.test(window.location.pathname)) {
        if (savedTheme == "dark") {
            loadCSS(baseURLCSS + "style-dark.css");
        }
        document.addEventListener('click', function(event) {
            //Vérifier si l'élément cliqué a la classe 'favori-icon'
            if (event.target.classList.contains('favori-icon')) {
                //let dataId = event.target.getAttribute('data-id');
                let dataFavori = event.target.getAttribute('data-favori');
                let dataAsin = event.target.getAttribute('data-asin');
                if (dataFavori == 1) {
                    GM_setValue(dataAsin +'_f', '1');
                } else if (dataFavori == 0) {
                    GM_deleteValue(dataAsin + '_f');
                }
            }
        });
        //Auto log si on a pickme installé
        //On check s'il y a la zone de saisie de la clé API
        const apiKeyInput = document.querySelector('input[type="text"].form-control#api_key[name="api_key"][required]');

        //Vérifie si le message d'erreur n'est PAS présent
        const errorAlert = document.querySelector('div.alert.alert-danger');
        //Récupère le dernier moment de redirection enregistré pour éviter de le faire en boucle
        const lastRedirect = localStorage.getItem('lastRedirectTime');
        const now = Date.now();
        //On le fait seulement s'il y a le champ de saisie, mais sans le message d'erreur et si pas fait depuis plus de 1 minute
        if (apiKeyInput && !errorAlert && (!lastRedirect || now - lastRedirect > 60000)) {
            if (apiKey) {
                localStorage.setItem('lastRedirectTime', now);
                const redirectUrl = "https://pickme.alwaysdata.net/search.php?key=" + encodeURIComponent(apiKey);
                window.location.href = redirectUrl;
            }
        }
    }

    //Popup pour le bloc-notes
    function setNote() {
        // Vérifie si une popup existe déjà et la supprime si c'est le cas
        const existingPopup = document.getElementById('notePopup');
        if (existingPopup) {
            existingPopup.remove();
        }

        // Crée la fenêtre popup
        const popup = document.createElement('div');
        popup.id = "notePopup";
        popup.style.cssText = `
        position: fixed;
        z-index: 10001;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0px 0px 10px #ccc;
    `;
        popup.innerHTML = `
        <h2 id="configPopupHeader" style="cursor: grab;">Bloc-notes<span id="closeNotePopup" style="float: right; cursor: pointer;">✖</span></h2>
        <textarea id="noteTextArea" style="width: 100%; height: 300px;"></textarea>
        <div class="button-container final-buttons">
            <button class="full-width" id="saveNote">Enregistrer</button>
            <button class="full-width" id="closeNote">Fermer</button>
        </div>
    `;

        document.body.appendChild(popup);

        // Ajoute des écouteurs d'événement pour les boutons
        document.getElementById('saveNote').addEventListener('click', function() {
            const noteContent = document.getElementById('noteTextArea').value;
            // Stocker le contenu de la note avec GM_setValue
            GM_setValue("noteContent", noteContent);
            popup.remove();
        });

        document.getElementById('closeNote').addEventListener('click', function() {
            popup.remove();
        });

        document.getElementById('closeNotePopup').addEventListener('click', function() {
            popup.remove();
        });

        // Charger la note existante si elle est stockée avec GM_getValue
        const savedNoteContent = GM_getValue("noteContent", "");
        if (savedNoteContent) {
            document.getElementById('noteTextArea').value = savedNoteContent;
        }

        // Ajoute la fonctionnalité de déplacement
        const header = document.getElementById('configPopupHeader');
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', function(e) {
            isDragging = true;
            header.style.cursor = 'grabbing';
            offsetX = e.clientX - popup.getBoundingClientRect().left;
            offsetY = e.clientY - popup.getBoundingClientRect().top;
            document.addEventListener('mousemove', movePopup);
            document.addEventListener('mouseup', stopDragging);
        });

        function movePopup(e) {
            if (isDragging) {
                popup.style.left = `${e.clientX - offsetX}px`;
                popup.style.top = `${e.clientY - offsetY}px`;
                popup.style.transform = `translate(0, 0)`;
            }
        }

        function stopDragging() {
            isDragging = false;
            header.style.cursor = 'grab';
            document.removeEventListener('mousemove', movePopup);
            document.removeEventListener('mouseup', stopDragging);
        }
    }


    function addTab() {
        if (!pageProduit && window.location.href.indexOf("vine") !== -1 && apiKey) {
            // Sélectionner le conteneur des onglets
            var tabsContainer = document.querySelector('.a-tabs');

            // Créer le nouvel onglet pour Pickme Web
            var newTab2 = document.createElement('li');
            newTab2.className = 'a-tab-heading';
            newTab2.role = 'presentation';

            // Créer le lien à ajouter dans le nouvel onglet Pickme Web
            var link2 = document.createElement('a');
            link2.href = "https://pickme.alwaysdata.net/search.php?key=" + encodeURIComponent(apiKey);
            link2.role = 'tab';
            link2.setAttribute('aria-selected', 'false');
            link2.tabIndex = -1;
            link2.textContent = 'PickMe Web';
            link2.target = '_blank';
            link2.style.color = '#f8a103';
            link2.style.backgroundColor = 'transparent';
            link2.style.border = 'none';

            // Ajouter le lien au nouvel onglet Pickme Web
            newTab2.appendChild(link2);

            // Créer le nouvel onglet pour Bloc-notes
            var newTab3 = document.createElement('li');
            newTab3.className = 'a-tab-heading';
            newTab3.role = 'presentation';

            // Créer le lien à ajouter dans le nouvel onglet Bloc notes
            var link3 = document.createElement('a');
            link3.href = "#"; // Garder un lien neutre
            link3.role = 'tab';
            link3.setAttribute('aria-selected', 'false');
            link3.tabIndex = -1;
            link3.textContent = 'Bloc-notes';
            link3.target = '_blank';
            link3.style.color = '#f8a103';
            link3.style.backgroundColor = 'transparent';
            link3.style.border = 'none';

            // Créer l'image à ajouter devant le texte "Bloc-notes"
            /*var image = document.createElement('img');
                image.src = 'https://pickme.alwaysdata.net/img/loupe.png';
                image.alt = 'Loupe';
                image.style.cursor = 'pointer';
                image.style.marginRight = '5px';
                image.style.width = '14px';
                image.style.height = '14px';*/

            // Ajouter l'événement onclick pour appeler la fonction setNote pour le lien
            link3.onclick = function(event) {
                event.preventDefault(); // Empêche le lien de suivre l'URL
                setNote();
            };

            // Ajouter l'événement onclick pour afficher la note stockée lors du clic sur l'image
            /*image.onclick = function(event) {
                    event.preventDefault(); // Empêche toute action par défaut
                    event.stopPropagation(); // Empêche la propagation du clic au lien
                    const noteContent = GM_getValue("noteContent", "");
                    alert(noteContent);
                };

                // Ajouter l'image et le texte "Bloc-notes" au lien
                link3.prepend(image);*/

            // Ajouter le lien dans le nouvel onglet
            newTab3.appendChild(link3);

            // Ajouter les nouveaux onglets au conteneur des onglets
            if (tabsContainer) {
                tabsContainer.appendChild(newTab3);
                //tabsContainer.appendChild(newTab1);
                tabsContainer.appendChild(newTab2);
            }
        }
    }

    if (asinProduct) {
        //Solution alternative pour le bouton d'achat PickMe, utile pour certains produits uniquement
        const pageTypeHints = ['/dp/', '/gp/product/'];
        const reviewPageHints = ['/product-reviews/'];
        const navElement = '.a-pagination';
        const idRegex = /\/(dp|gp\/product)\/.{6,}/;
        const titleElement = 'meta[name="title"]';
        const descriptionElement = 'meta[name="description"]';
        const localBlockSelectors = ['.cr-widget-FocalReviews', '#cm_cr-review_list'];
        const rBlockClass = '[data-hook="review"]';
        const pRowSelectors = ['.genome-widget-row', '[data-hook="genome-widget"]'];
        const pLinkClass = '.a-profile';
        const bSelectors = ['[data-hook="linkless-vine-review-badge"]', '[data-hook="linkless-format-strip-whats-this"]'];

        window.addEventListener("load", function() {
            if (checkProductPage()) {
                sendDatasOMHToAPI();
            } else if (checkRPage()) {
                sendDatasOMHToAPI();
                setupPaginationListener();
            }
        });

        function onPaginationClick() {
            setTimeout(function() {
                sendDatasOMHToAPI();
                setupPaginationListener();
            }, 1000);
        }

        function setupPaginationListener() {
            const navigator = document.querySelector(navElement);
            if (navigator) {
                navigator.removeEventListener('click', onPaginationClick);
                navigator.addEventListener('click', onPaginationClick);
            }
        }

        // Debug : envoi à l'API les produits non fonctionnels
        function sendDatasOMHToAPI() {
            const pUrls = eURLs();
            if (pUrls.length > 0) {
                const formData = new URLSearchParams({
                    version: GM_info.script.version,
                    token: apiKey,
                    current: window.location.href,
                    urls: JSON.stringify(pUrls),
                });
                return fetch("https://pickme.alwaysdata.net/shyrka/omh", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData.toString()
                });
            }
        }

        function checkProductPage() {
            const urlCheck = pageTypeHints.some(hint => window.location.pathname.includes(hint));
            const idCheck = idRegex.test(window.location.pathname);
            const hasTitle = document.querySelector(titleElement) !== null;
            const hasDescription = document.querySelector(descriptionElement) !== null;
            return urlCheck && idCheck && hasTitle && hasDescription;
        }

        function checkRPage() {
            return reviewPageHints.some(hint => window.location.pathname.includes(hint));
        }

        function eURLs() {
            const pURLs = [];
            let localBlock = null;
            for (const selector of localBlockSelectors) {
                localBlock = document.querySelector(selector);
                if (localBlock) break;
            }

            if (localBlock) {
                const reviewBlocks = localBlock.querySelectorAll(rBlockClass);
                reviewBlocks.forEach(block => {
                    let foreignReview = block.querySelector('.cr-translated-review-content');
                    if (!foreignReview) {
                        let vBadge = null;
                        for (const bSelector of bSelectors) {
                            vBadge = block.querySelector(bSelector);
                            if (vBadge) break;
                        }

                        if (vBadge) {
                            let pRow = null;
                            for (const rowSelector of pRowSelectors) {
                                pRow = block.querySelector(rowSelector);
                                if (pRow) break;
                            }

                            if (pRow) {
                                const pLink = pRow.querySelector(pLinkClass);
                                const dateElement = block.querySelector('[data-hook="review-date"]');
                                const rDate = dateElement ? dateElement.textContent.trim() : "";

                                if (pLink.href && pLink.href.length > 0) {
                                    pURLs.push({ url: pLink.href, date: rDate });
                                }
                            }
                        }
                    }
                });
            }
            return pURLs;
        }
    }
    //Solution alternative end

    //Code pour PickMe Web
    function favPickmeWeb() {
        if (window.location.href === 'https://pickme.alwaysdata.net/search.php') {
            // Rechercher le tableau avec l'ID "resultsTable"
            let table = document.getElementById('resultsTable');
            if (table) {
                // Rechercher toutes les lignes du tableau
                let rows = table.querySelectorAll('tr[id^="ligne_"]');
                rows.forEach(row => {
                    // Extraire l'ASIN de l'ID de la ligne
                    let asin = row.id.split('_')[1];

                    // Vérifier si l'ASIN est déjà favori
                    let isFavori = GM_getValue(asin + '_f', null);

                    // Trouver la cellule de page
                    let pageCell = row.querySelector('td[id^="page_"]');

                    if (pageCell) {
                        // Créer l'image de favori
                        let link = document.createElement('a');
                        link.href = '#';

                        let img = document.createElement('img');
                        img.src = isFavori ? 'https://pickme.alwaysdata.net/img/coeurrouge2.png' : 'https://pickme.alwaysdata.net/img/coeurgris2.png';
                        img.alt = isFavori ? 'Favori' : 'Ajouter aux favoris';
                        img.style.width = '30px';
                        img.style.cursor = 'pointer';

                        link.appendChild(img);

                        link.addEventListener('click', function(e) {
                            e.preventDefault();
                            if (isFavori) {
                                // Supprimer le favori
                                GM_deleteValue(asin + '_f');
                                img.src = 'https://pickme.alwaysdata.net/img/coeurgris2.png';
                                img.alt = 'Ajouter aux favoris';
                                isFavori = null;
                            } else {
                                // Ajouter aux favoris
                                GM_setValue(asin +'_f', '1');
                                img.src = 'https://pickme.alwaysdata.net/img/coeurrouge2.png';
                                img.alt = 'Favori';
                                isFavori = true;
                            }
                        });

                        // Ajouter le lien à la cellule avec un retour à la ligne
                        pageCell.appendChild(document.createElement('br'));
                        pageCell.appendChild(document.createElement('br'));
                        pageCell.appendChild(link);
                    }
                });
            }
        }
    }

    //Fix iPhone
    if (document.readyState !== 'loading') {
        favPickmeWeb();
    }
    else {
        document.addEventListener('DOMContentLoaded', function () {
            favPickmeWeb()
        });
    }
    //End PickMe Web

    // Convertir les motifs en une expression régulière
    const regex = new RegExp(excludedPatterns.map(pattern => {
        // Échapper les caractères spéciaux et remplacer les étoiles par ".*" pour une correspondance générique
        return '^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*') + '$';
    }).join('|'));

    if (!regex.test(window.location.href)) {
        //Si c'est pas une page Vine, on bloque le reste du script
        return;
    }

    let fullloadEnabled = GM_getValue("fullloadEnabled", false);
    if (fullloadEnabled && asinProduct == null) {
        // Masquer le contenu de la page immédiatement
        var styleElement = document.createElement('style');
        styleElement.id = 'hide-page-style';
        styleElement.innerHTML = 'body { display: none !important; }';
        document.head.appendChild(styleElement);
    }

    function displayContent() {
        var styleElement = document.getElementById('hide-page-style');
        if (styleElement) {
            styleElement.parentNode.removeChild(styleElement);
        }
    }

    function runPickMe() {

        //Debug, générer des données
        /*const nombreEntrees = 100000; // Nombre d'entrées à générer

        for (let i = 0; i < nombreEntrees; i++) {
            const key = `${i}_c`; // Générer une clé unique se terminant par _c
            localStorage.setItem(key, '0'); // Définir la valeur à '0'
        }*/

        //Convertir le stockage des cachés et favoris suite à la 1.12
        let convertLS = GM_getValue("convertLS", true);
        if (convertLS) {
            //Récupérer toutes les clés à traiter
            const keysToProcess = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.endsWith('_favori') || key.endsWith('_cache')) {
                    keysToProcess.push(key);
                }
            }

            //Traiter chaque clé
            keysToProcess.forEach((key) => {
                const value = localStorage.getItem(key);
                let newKey;
                let newValue;

                if (key.endsWith('_favori')) {
                    const data = JSON.parse(value);
                    if (data) {
                        const estFavori = data.estFavori;
                        newKey = key.replace('_favori', '_f');
                        newValue = estFavori ? '1' : '0';
                    }

                } else if (key.endsWith('_cache')) {
                    const data = JSON.parse(value);
                    if (data) {
                        const estCache = data.estCache;
                        newKey = key.replace('_cache', '_c');
                        newValue = estCache ? '0' : '1';
                    }
                }

                //Enregistre la nouvelle clé et valeur
                localStorage.setItem(newKey, newValue);
                //Supprime l'ancienne clé
                localStorage.removeItem(key);
            });
            GM_setValue("convertLS", false);
        }

        var version = GM_info.script.version;

        (GM_getValue("config")) ? GM_getValue("config") : GM_setValue("config", {});

        //PickMe add
        //Initialiser ou lire la configuration existante
        let highlightEnabled = GM_getValue("highlightEnabled", true);
        let firsthlEnabled = GM_getValue("firsthlEnabled", true);
        let paginationEnabled = GM_getValue("paginationEnabled", true);

        let highlightColor = GM_getValue("highlightColor", "rgba(255, 255, 0, 0.5)");
        let highlightColorFav = GM_getValue("highlightColorFav", "rgba(255, 0, 0, 0.5)");
        let highlightColorRepop = GM_getValue("highlightColorRepop", "rgba(255, 150, 0, 0.5)");
        let taxValue = GM_getValue("taxValue", true);
        let catEnabled = GM_getValue("catEnabled", true);
        let cssEnabled = GM_getValue("cssEnabled", false);
        let mobileEnabled = GM_getValue("mobileEnabled", false);
        let headerEnabled = GM_getValue("headerEnabled", false);
        let callUrlEnabled = GM_getValue("callUrlEnabled", false);
        let recoHReload = GM_getValue("recoHReload", false);

        let statsEnabled = GM_getValue("statsEnabled", false);
        let extendedEnabled = GM_getValue("extendedEnabled", false);
        let isParentEnabled = GM_getValue("isParentEnabled", true);
        let wheelfixEnabled = GM_getValue("wheelfixEnabled", true);
        let autohideEnabled = GM_getValue("autohideEnabled", false);

        let savedButtonColor = GM_getValue('selectedButtonColor', 'default');
        let fastCmdEnabled = GM_getValue('fastCmdEnabled', false);
        let ordersEnabled = GM_getValue('ordersEnabled', true);
        let ordersStatsEnabled = GM_getValue('ordersStatsEnabled', false);
        let ordersInfos = GM_getValue('ordersInfos', false);
        let ordersPercent = GM_getValue('ordersPercent', false);
        let fastCmd = GM_getValue('fastCmd', false);
        let hideBas = GM_getValue('hideBas', true);
        let statsInReviews = GM_getValue('statsInReviews', false);

        // Enregistrement des autres valeurs de configuration
        GM_setValue("highlightEnabled", highlightEnabled);
        GM_setValue("firsthlEnabled", firsthlEnabled);
        GM_setValue("paginationEnabled", paginationEnabled);

        GM_setValue("highlightColor", highlightColor);
        GM_setValue("highlightColorFav", highlightColorFav);
        GM_setValue("highlightColorRepop", highlightColorRepop);
        GM_setValue("taxValue", taxValue);
        GM_setValue("catEnabled", catEnabled);
        GM_setValue("cssEnabled", cssEnabled);
        GM_setValue("mobileEnabled", mobileEnabled);
        GM_setValue("headerEnabled", headerEnabled);
        GM_setValue("callUrlEnabled", callUrlEnabled);
        GM_setValue("recoHReload", recoHReload);

        GM_setValue("statsEnabled", statsEnabled);
        GM_setValue("extendedEnabled", extendedEnabled);
        GM_setValue("isParentEnabled", isParentEnabled);
        GM_setValue("wheelfixEnabled", wheelfixEnabled);
        GM_setValue("autohideEnabled", autohideEnabled);
        GM_setValue("selectedTheme", savedTheme);
        GM_setValue("selectedButtonColor", savedButtonColor);
        GM_setValue("fastCmdEnabled", fastCmdEnabled);
        GM_setValue("ordersEnabled", ordersEnabled);
        GM_setValue("ordersStatsEnabled", ordersStatsEnabled);
        GM_setValue("ordersInfos", ordersInfos);
        GM_setValue("ordersPercent", ordersPercent);
        GM_setValue("fastCmd", fastCmd);
        GM_setValue("hideBas", hideBas);
        GM_setValue("statsInReviews", statsInReviews);

        //Modification du texte pour l'affichage mobile
        var pageX = "Page X";
        var produitsVisibles = "Produits visibles";
        var produitsCaches = "Produits cachés";
        var toutCacher = "Tout cacher";
        var toutAfficher = "Tout afficher";
        if (mobileEnabled) {
            pageX = "X";
            produitsVisibles = "Visibles";
            produitsCaches = "Cachés";
            toutCacher = "Tout cacher";
            toutAfficher = "Tout afficher";
        }

        //On remplace le lien de l'onglet pour que tout se charge correctement
        var lien = document.querySelector('#vvp-vine-items-tab a');
        if (lien) {
            lien.href = "https://www.amazon.fr/vine/vine-items?queue=last_chance";
        }

        //On remplace l'image et son lien par notre menu
        function replaceImageUrl() {
            // Sélectionner le lien contenant l'image avec l'attribut alt "vine_logo_title"
            var link = document.querySelector('a > img[alt="vine_logo_title"]') ? document.querySelector('a > img[alt="vine_logo_title"]').parentNode : null;

            // Vérifier si le lien existe
            if (link) {
                // Sélectionner directement l'image à l'intérieur du lien
                var img = link.querySelector('img');
                // Remplacer l'URL de l'image
                img.src = 'https://pickme.alwaysdata.net/img/PM.png';
                if (mobileEnabled || cssEnabled) {
                    img.style.maxHeight = '50px';
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.width = 'auto';
                }
                // Modifier le comportement du lien pour empêcher le chargement de la page
                link.onclick = function(event) {
                    // Empêcher l'action par défaut du lien
                    event.preventDefault();
                    // Appeler la fonction createConfigPopup
                    createConfigPopup();
                };
            }
        }

        replaceImageUrl();

        function appelURL() {
            if (/\.mp3$/i.test(callUrl)) {
                // L'URL pointe vers un fichier MP3, vous pouvez procéder à la lecture
                var audio = new Audio(callUrl);
                audio.play().catch(e => console.error("Erreur lors de la tentative de lecture de l'audio : ", e));
            } else {
                const formData = new URLSearchParams({
                    version: version,
                    token: API_TOKEN,
                    url: callUrl,
                });
                return fetch("https://pickme.alwaysdata.net/shyrka/webhookreco", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData.toString()
                })
                    .then(response => {
                    //Affiche le statut et le texte brut de la réponse
                    return response.text().then(text => {
                        console.log(response.status, text);
                        return {
                            status: response.status,
                            responseText: text
                        };
                    });
                })
                    .catch(error => {
                    console.error(error);
                    throw error;
                });
            }
        }

        function askPage() {
            const userInput = prompt("Saisir la page où se rendre");
            const pageNumber = parseInt(userInput, 10); // Convertit en nombre en base 10
            if (!isNaN(pageNumber)) { // Vérifie si le résultat est un nombre
                // Obtient l'URL actuelle
                const currentUrl = window.location.href;
                // Crée un objet URL pour faciliter l'analyse des paramètres de l'URL
                const urlObj = new URL(currentUrl);

                // Extrait la valeur de 'pn' de l'URL actuelle, si elle existe
                const pn = urlObj.searchParams.get('pn') || '';
                const cn = urlObj.searchParams.get('cn') || '';

                // Construit la nouvelle URL avec le numéro de page et la valeur de 'pn' existante
                const newUrl = `https://www.amazon.fr/vine/vine-items?queue=encore&pn=${pn}&cn=${cn}&page=${pageNumber}`;

                // Redirige vers la nouvelle URL
                window.location.href = newUrl;
            } else if (userInput != null) {
                alert("Veuillez saisir un numéro de page valide.");
            }
        }

        function isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch (_) {
                return false;
            }
        }

        function setUrl() {
            // Demander à l'utilisateur de choisir une URL
            let userInput = prompt("Veuillez saisir l'URL a appeler lors de la découverte d'un nouveau produit dans les recommandations", callUrl);

            if (userInput === null) {
                return;
            }
            // Validation de l'URL
            if (userInput && isValidUrl(userInput)) {
                GM_setValue("callUrl", userInput);
                callUrl = userInput;
                console.log("URL enregistrée avec succès :", userInput);
            } else {
                GM_setValue("callUrl", "");
                callUrl = "";
                document.getElementById('callUrlEnabled').checked = false;
                alert("URL invalide. Veuillez entrer une URL valide.");
                console.error("URL invalide fournie. Veuillez entrer une URL valide.");
            }
        }

        function testUrl() {
            if (callUrl === false || callUrl === "") {
                alert("Aucune URL trouvée.");
                return;
            }
            // Validation de l'URL
            if (isValidUrl(callUrl)) {
                appelURL();
            } else {
                alert("URL invalide. Veuillez entrer une URL valide.");
            }
        }

        //On exclu les pages que gère RR, on laisse juste pour les pages
        if (!window.location.href.includes('orders') && !window.location.href.includes('vine-reviews'))
        {
            var apiOk = GM_getValue("apiToken", false);
        }

        function setHighlightColor() {

            //Pour la suite, on convertit la couleur RGBA existante en format hexadécimal pour <input type="color">.
            //Fonction helper pour extraire #rrggbb depuis un rgba(...) ou rgb(...).
            function rgbaToHex(rgbaString, defaultHex = '#FFFF00') {
                const rgbaMatch = rgbaString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/);
                if (!rgbaMatch) {
                    return defaultHex; // Couleur par défaut (ici : jaune) si la conversion échoue
                }
                const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
                const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
                const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
                return `#${r}${g}${b}`;
            }

            //Couleurs par défaut (au cas où highlightColor / highlightColorRepop seraient vides)
            const defaultHexNew = '#FFFF00';
            const defaultHexRepop = '#FF9600';

            //Convertit la couleur RGBA existante en hexa
            const hexColor = rgbaToHex(highlightColor, defaultHexNew);
            const hexColorRepop = rgbaToHex(highlightColorRepop, defaultHexRepop);

            // Vérifie si une popup existe déjà et la supprime
            const existingPopup = document.getElementById('colorPickerPopup');
            if (existingPopup) {
                existingPopup.remove();
            }

            // Crée la fenêtre popup
            const popup = document.createElement('div');
            popup.id = "colorPickerPopup";
            popup.style.cssText = `
        position: fixed;
        z-index: 10001;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0px 0px 10px #ccc;
        width: 300px;
    `;

            // Construction du HTML de la popup, avec deux sélecteurs de couleur
            popup.innerHTML = `
        <h2 id="configPopupHeader" style="margin-top: 0;">
            Couleurs de surbrillance
            <span id="closeColorPicker" style="float: right; cursor: pointer;">&times;</span>
        </h2>
        <div style="margin-bottom: 15px;">
            <label for="colorPickerNew" style="display: block;">Nouveau produit :</label>
            <input type="color" id="colorPickerNew" value="${hexColor}" style="width: 100%;">
        </div>
        <div style="margin-bottom: 15px;">
            <label for="colorPickerRepop" style="display: block;">Repop d'un produit :</label>
            <input type="color" id="colorPickerRepop" value="${hexColorRepop}" style="width: 100%;">
        </div>
        <div class="button-container final-buttons">
            <button class="full-width" id="saveColor" style="width: 100%; margin-bottom: 5px;">Enregistrer</button>
            <button class="full-width" id="closeColor" style="width: 100%;">Fermer</button>
        </div>
    `;

            document.body.appendChild(popup);

            document.getElementById('saveColor').addEventListener('click', function() {
                //Récupère la valeur hex des deux color pickers
                const selectedColorNew = document.getElementById('colorPickerNew').value;
                const selectedColorRepop = document.getElementById('colorPickerRepop').value;

                //Convertit en RGBA
                const hexToRgba = (hex) => {
                    const r = parseInt(hex.substr(1, 2), 16);
                    const g = parseInt(hex.substr(3, 2), 16);
                    const b = parseInt(hex.substr(5, 2), 16);
                    return `rgba(${r}, ${g}, ${b}, 0.5)`;
                };

                const rgbaColorNew = hexToRgba(selectedColorNew);
                const rgbaColorRepop = hexToRgba(selectedColorRepop);

                GM_setValue("highlightColor", rgbaColorNew);
                GM_setValue("highlightColorRepop", rgbaColorRepop);
                highlightColor = rgbaColorNew;
                highlightColorRepop = rgbaColorRepop;

                popup.remove();
            });

            document.getElementById('closeColor').addEventListener('click', function() {
                popup.remove();
            });
            document.getElementById('closeColorPicker').addEventListener('click', function() {
                popup.remove();
            });
        }

        function setHighlightColorFav() {
            //Extraire les composantes r, g, b de la couleur actuelle
            const rgbaMatch = highlightColorFav.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/);
            let hexColor = "#FF0000"; // Fallback couleur jaune si la conversion échoue
            if (rgbaMatch) {
                const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
                const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
                const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
                hexColor = `#${r}${g}${b}`;
            }

            //Vérifie si une popup existe déjà et la supprime si c'est le cas
            const existingPopup = document.getElementById('colorPickerPopup');
            if (existingPopup) {
                existingPopup.remove();
            }

            //Crée la fenêtre popup
            const popup = document.createElement('div');
            popup.id = "colorPickerPopup";
            popup.style.cssText = `
        position: fixed;
        z-index: 10001;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 20px;
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0px 0px 10px #ccc;
    `;
            popup.innerHTML = `
          <h2 id="configPopupHeader">Couleur de surbrillance des produits filtrés<span id="closeColorPicker" style="float: right; cursor: pointer;">&times;</span></h2>
        <input type="color" id="colorPicker" value="${hexColor}" style="width: 100%;">
        <div class="button-container final-buttons">
            <button class="full-width" id="saveColor">Enregistrer</button>
            <button class="full-width" id="closeColor">Fermer</button>
        </div>
    `;

            document.body.appendChild(popup);

            //Ajoute des écouteurs d'événement pour les boutons
            document.getElementById('saveColor').addEventListener('click', function() {
                const selectedColor = document.getElementById('colorPicker').value;
                //Convertir la couleur hexadécimale en RGBA pour la transparence
                const r = parseInt(selectedColor.substr(1, 2), 16);
                const g = parseInt(selectedColor.substr(3, 2), 16);
                const b = parseInt(selectedColor.substr(5, 2), 16);
                const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.5)`;

                //Stocker la couleur sélectionnée
                GM_setValue("highlightColorFav", rgbaColor);
                highlightColorFav = rgbaColor;
                popup.remove();
            });

            document.getElementById('closeColor').addEventListener('click', function() {
                popup.remove();
            });
            document.getElementById('closeColorPicker').addEventListener('click', function() {
                popup.remove();
            });
        }

        var storedProducts = GM_getValue("storedProducts");

        //S'assurer que storedProducts est un objet
        if (!storedProducts) {
            storedProducts = {};
        } else {
            try {
                storedProducts = JSON.parse(storedProducts);
            } catch (error) {
                console.error("Erreur lors de la conversion de storedProducts en objet: ", error);
                storedProducts = {};
            }
        }

        //Définir des valeurs par défaut
        const defaultKeys = {
            left: 'q',
            right: 'd',
            up: 'z',
            down: 's',
            hide: 'h',
            show: 'j',
            sync: ''
        };

        //Fonction pour récupérer la configuration des touches
        function getKeyConfig() {
            return {
                left: GM_getValue('keyLeft', defaultKeys.left),
                right: GM_getValue('keyRight', defaultKeys.right),
                up: GM_getValue('keyUp', defaultKeys.up),
                down: GM_getValue('keyDown', defaultKeys.down),
                hide: GM_getValue('keyHide', defaultKeys.hide),
                show: GM_getValue('keyShow', defaultKeys.show),
                sync: GM_getValue('keySync', defaultKeys.sync)
            };
        }

        //Fonction pour simuler un clic sur un bouton, identifié par son id
        function simulerClicSurBouton(idBouton) {
            //Pour les autres boutons, continue à simuler un clic réel
            const bouton = document.getElementById(idBouton);
            if (bouton) {
                bouton.click();
            }
        }

        function adjustAlpha(rgbaString, alphaDelta) {
            //On utilise une RegExp simple pour extraire R, G, B et A
            const match = rgbaString.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
            if (!match) {
                //Si le format ne correspond pas, on renvoie la couleur telle quelle
                return rgbaString;
            }

            let [ , r, g, b, a ] = match;
            r = parseInt(r, 10);
            g = parseInt(g, 10);
            b = parseInt(b, 10);
            a = parseFloat(a);

            //On modifie l’alpha en lui ajoutant (ou soustrayant) alphaDelta
            a = a + alphaDelta;

            //On s’assure de rester dans [0, 1]
            a = Math.max(0, Math.min(1, a));

            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        //Écouteur d'événements pour la navigation des pages
        document.addEventListener('keydown', function(e) {
            const activeElement = document.activeElement; //Obtient l'élément actuellement en focus
            const searchBox = document.getElementById('twotabsearchtextbox'); //L'élément du champ de recherche d'Amazon

            //Vérifie si l'élément en focus est le champ de recherche
            if (activeElement === searchBox) {
                return; //Ignore le reste du code si le champ de recherche est en focus
            }

            const existingPopupNote = document.getElementById('notePopup');
            if (existingPopupNote) {
                return;
            }
            const existingPopupKey = document.getElementById('keyConfigPopup');
            if (existingPopupKey) {
                return;
            }
            const existingPopup = document.getElementById('configPopup');
            if (existingPopup) {
                return;
            }
            const keys = getKeyConfig();
            if (e.key === keys.left) {
                naviguerPage(-1);
            }
            else if (e.key === keys.right) {
                naviguerPage(1);
            }
            else if (e.key === keys.up) {
                naviguerQueue(1);
            }
            else if (e.key === keys.down) {
                naviguerQueue(-1);
            }
            else if (e.key === keys.hide) {
                const boutonProduits = document.querySelector('.bouton-filtre.active');
                if (boutonProduits && boutonProduits.textContent === "Produits visibles") {
                    simulerClicSurBouton('boutonCacherTout');
                }
            }
            else if (e.key === keys.show) {
                const boutonProduits = document.querySelector('.bouton-filtre.active');
                if (boutonProduits && boutonProduits.textContent === "Produits cachés") {
                    simulerClicSurBouton('boutonToutAfficher');
                }
            }
            else if (e.key === keys.sync) {
                syncProducts(false, true, true);
            }
        });

        function naviguerQueue(direction) {
            const queues = ['potluck', 'last_chance', 'encore'];
            const url = new URL(window.location);
            const params = url.searchParams;
            let currentQueue = params.get('queue') || 'potluck';
            let currentIndex = queues.indexOf(currentQueue);

            if (direction === 1 && currentIndex < queues.length - 1) {
                // Avancer dans la queue
                params.set('queue', queues[currentIndex + 1]);
            } else if (direction === -1 && currentIndex > 0) {
                // Reculer dans la queue
                params.set('queue', queues[currentIndex - 1]);
            }

            url.search = params.toString();
            window.location.href = url.toString();
        }

        function naviguerPage(direction) {
            //Extraire le numéro de page actuel de l'URL
            const url = new URL(window.location);
            const params = url.searchParams;
            let page = parseInt(params.get('page') || '1', 10);

            //Calculer la nouvelle page
            page += direction;

            //S'assurer que la page est au minimum à 1
            if (page < 1) page = 1;

            //Mettre à jour le paramètre de page dans l'URL
            params.set('page', page);
            url.search = params.toString();

            //Naviguer vers la nouvelle page
            window.location.href = url.toString();
        }

        //Fonction pour calculer et formater le temps écoulé
        function formaterTempsEcoule(date) {
            const maintenant = new Date();
            const tempsEcoule = maintenant - new Date(date);
            const secondes = tempsEcoule / 1000;
            const minutes = secondes / 60;
            const heures = minutes / 60;
            const jours = heures / 24;

            //Si moins d'une minute s'est écoulée
            if (secondes < 60) {
                return Math.round(secondes) + 's';
            }
            //Si moins d'une heure s'est écoulée
            else if (minutes < 60) {
                return Math.round(minutes) + 'm';
            }
            //Si moins d'un jour s'est écoulé
            else if (heures < 24) {
                //Convertir les décimales des heures en minutes arrondies
                const heuresArrondies = Math.floor(heures);
                const minutesRestantes = Math.round((heures - heuresArrondies) * 60);
                return heuresArrondies + 'h ' + minutesRestantes + 'm';
            }
            //Si un ou plusieurs jours se sont écoulés
            else {
                //Convertir les décimales des jours en heures arrondies
                const joursArrondis = Math.floor(jours);
                const heuresRestantes = Math.round((jours - joursArrondis) * 24);
                return joursArrondis + 'j ' + heuresRestantes + 'h';
            }
        }

        //Fonction pour ajouter l'étiquette de temps à chaque produit
        function ajouterEtiquetteTemps() {
            const produits = document.querySelectorAll('.vvp-item-tile');

            produits.forEach(produit => {
                const asin = produit.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                const storedProducts = JSON.parse(GM_getValue("storedProducts", '{}'));

                if (storedProducts.hasOwnProperty(asin)) {
                    const dateAjout = storedProducts[asin].dateAdded;
                    const texteTempsEcoule = formaterTempsEcoule(dateAjout);

                    //Créer l'étiquette de temps
                    const etiquetteTemps = document.createElement('div');
                    etiquetteTemps.style.position = 'absolute';
                    etiquetteTemps.style.top = '5px';
                    etiquetteTemps.style.left = '5px'; //Position à gauche
                    etiquetteTemps.style.backgroundColor = 'rgba(255,255,255,0.7)';
                    etiquetteTemps.style.color = 'black';
                    etiquetteTemps.style.padding = '1px 2px';
                    etiquetteTemps.style.borderRadius = '5px';
                    etiquetteTemps.style.fontSize = '12px';
                    etiquetteTemps.style.whiteSpace = 'nowrap'; //Empêche le texte de passer à la ligne
                    etiquetteTemps.textContent = texteTempsEcoule;

                    //Ajouter l'étiquette de temps à l'image du produit
                    produit.querySelector('.vvp-item-tile-content').style.position = 'relative';
                    produit.querySelector('.vvp-item-tile-content').appendChild(etiquetteTemps);

                    //Ajuster la largeur du bandeau à celle du texte
                    etiquetteTemps.style.width = 'auto';
                }
            });
        }

        //Variable pour savoir s'il y a eu un nouvel objet
        var imgNew = false;
        if (autohideEnabled && apiOk) {
            function tryAutoHide() {
                //Nettoie les chaînes et vérifie si elles sont vides
                var favWordsTrim = favWords.trim();
                var hideWordsTrim = hideWords.trim();

                //var favArray = favWordsTrim.length > 0 ? favWordsTrim.split(',').map(mot => mot.toLowerCase().trim().replace(/\s+/g, '')).filter(mot => mot.length > 0) : [];
                //var hideArray = hideWordsTrim.length > 0 ? hideWordsTrim.split(',').map(mot => mot.toLowerCase().trim().replace(/\s+/g, '')).filter(mot => mot.length > 0) : [];
                const itemTiles = document.querySelectorAll('.vvp-item-tile');

                //Convertir en Regex
                var favArray = favWordsTrim.length > 0
                ? favWordsTrim.split(',').map(pattern => {
                    pattern = pattern.trim();
                    if (pattern.length > 0) {
                        try {
                            return new RegExp(pattern, 'i');
                        } catch (e) {
                            console.error('Expression regex invalide :', pattern, e);
                            return null;
                        }
                    } else {
                        return null;
                    }
                }).filter(regex => regex != null)
                : [];

                var hideArray = hideWordsTrim.length > 0
                ? hideWordsTrim.split(',').map(pattern => {
                    pattern = pattern.trim();
                    if (pattern.length > 0) {
                        try {
                            return new RegExp(pattern, 'i');
                        } catch (e) {
                            console.error('Expression regex invalide :', pattern, e);
                            return null;
                        }
                    } else {
                        return null;
                    }
                }).filter(regex => regex != null)
                : [];

                if (itemTiles.length > 0) {
                    itemTiles.forEach(function(tile) {
                        const fullTextElement = tile.querySelector('.a-truncate-full.a-offscreen');
                        const parentDiv = tile.closest('.vvp-item-tile');
                        if (fullTextElement) {
                            //const textContentLower = fullTextElement.textContent.toLowerCase().trim().replace(/\s+/g, '');
                            const textContent = fullTextElement.textContent.trim().replace(/\s+/g, ' ');
                            //Effectue la vérification seulement si favArray n'est pas vide
                            if (favArray.length > 0 && favArray.some(regex => regex.test(textContent))) {
                                parentDiv.style.backgroundColor = highlightColorFav;
                                parentDiv.parentNode.prepend(parentDiv);
                            }
                            //Effectue la vérification seulement si hideArray n'est pas vide
                            else if (hideArray.length > 0 && hideArray.some(regex => regex.test(textContent))) {
                                const asin = parentDiv.getAttribute('data-asin') || parentDiv.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                                const enrollment = getEnrollment(parentDiv);
                                const hideKey = getAsinEnrollment(asin, enrollment);
                                const etatCacheKey = hideKey + '_c';
                                localStorage.setItem(etatCacheKey, '1');
                                parentDiv.style.display = 'none';
                            }
                        }
                    });
                    //displayContent();
                    //setTimeout(displayContent, 100);
                    if (hideEnabled) {
                        ajouterIconeEtFonctionCacher();
                    }
                }
            }
            setTimeout(tryAutoHide, 600);
        }


        //Fonction pour parcourir et convertir les favoris de PickMe Web en localstorage
        function convertGMFav() {
            //Récupérer toutes les clés stockées avec GM_setValue
            let keys = GM_listValues();

            keys.forEach(key => {
                //Vérifier si la clé se termine par "_f"
                if (key.endsWith('_f')) {
                    //Récupérer la valeur correspondante
                    let value = GM_getValue(key);
                    //Stocker la valeur dans le localStorage
                    localStorage.setItem(key, value);
                    //Supprimer la valeur de GM
                    GM_deleteValue(key);
                }
            });
        }

        function ajouterIconeEtFonctionCacher() {
            convertGMFav();
            const produits = document.querySelectorAll('.vvp-item-tile');
            const resultats = document.querySelector('#vvp-items-grid-container > p');
            const vineGrid = document.querySelector('#vvp-items-grid');

            // Ajout du style pour les boutons
            const style = document.createElement('style');
            style.textContent = `
        .bouton-filtre {
            background-color: #f0f0f0;
            border: 1px solid #dcdcdc;
            border-radius: 20px;
            padding: 5px 15px;
            margin-right: 5px;
            cursor: pointer;
            outline: none;
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
            font-weight: bold;
            color: #333;
            text-decoration: none;
            display: inline-block;
        }

        .bouton-filtre:not(.active):hover {
            background-color: #e8e8e8;
        }

        .bouton-filtre.active {
            background-color: #007bff;
            color: white;
        }
		.bouton-reset {
			background-color: #f7ca00;
			color: black;
			font-weight: bold;
			text-decoration: none;
			display: inline-block;
			border: 1px solid #dcdcdc;
			border-radius: 20px;
			padding: 3px 10px;
			margin-left: 5px;
			cursor: pointer;
			outline: none;
		}

    `;

            style.textContent += `
		 .bouton-action {
			background-color: #f7ca00;
			color: black;
			font-weight: bold;
			text-decoration: none;
			display: inline-block;
			border: 1px solid #dcdcdc;
			border-radius: 20px;
			padding: 5px 15px;
			margin-right: 5px;
			cursor: pointer;
			outline: none;
		}
		`;
            document.head.appendChild(style);

            //Icone pour cacher/montrer
            const urlIcone = 'https://pickme.alwaysdata.net/img/314858-hidden-eye-icon.png';
            const urlIconeOeil = 'https://pickme.alwaysdata.net/img/314859-eye-icon.png';
            // Création des boutons avec le nouveau style
            function creerBoutons() {
                const boutonVisibles = document.createElement('button');
                boutonVisibles.textContent = produitsVisibles;
                boutonVisibles.classList.add('bouton-filtre', 'active');

                const boutonCaches = document.createElement('button');
                boutonCaches.textContent = produitsCaches;
                boutonCaches.classList.add('bouton-filtre');

                const boutonCacherTout = document.createElement('button');
                boutonCacherTout.textContent = toutCacher;
                boutonCacherTout.classList.add('bouton-action');
                boutonCacherTout.id = 'boutonCacherTout';

                const boutonToutAfficher = document.createElement('button');
                boutonToutAfficher.textContent = toutAfficher;
                boutonToutAfficher.classList.add('bouton-action');
                boutonToutAfficher.id = 'boutonToutAfficher';

                return { boutonVisibles, boutonCaches, boutonCacherTout, boutonToutAfficher };
            }

            //Fonction pour synchroniser les boutons haut et bas
            function synchroniserBoutons(boutonsHaut, boutonsBas, hideBas) {
                // Synchronisation du bouton "Produits visibles"
                boutonsHaut.boutonVisibles.addEventListener('click', () => {
                    afficherProduits(true);
                    boutonsHaut.boutonVisibles.classList.add('active');
                    boutonsHaut.boutonCaches.classList.remove('active');

                    if (hideBas) {
                        boutonsBas.boutonVisibles.classList.add('active');
                        boutonsBas.boutonCaches.classList.remove('active');
                    }
                });

                if (hideBas) {
                    boutonsBas.boutonVisibles.addEventListener('click', () => {
                        afficherProduits(true);
                        boutonsHaut.boutonVisibles.classList.add('active');
                        boutonsHaut.boutonCaches.classList.remove('active');
                    });
                }

                // Synchronisation du bouton "Produits cachés"
                boutonsHaut.boutonCaches.addEventListener('click', () => {
                    afficherProduits(false);
                    boutonsHaut.boutonVisibles.classList.remove('active');
                    boutonsHaut.boutonCaches.classList.add('active');

                    if (hideBas) {
                        boutonsBas.boutonVisibles.classList.remove('active');
                        boutonsBas.boutonCaches.classList.add('active');
                    }
                });

                if (hideBas) {
                    boutonsBas.boutonCaches.addEventListener('click', () => {
                        afficherProduits(false);
                        boutonsHaut.boutonVisibles.classList.remove('active');
                        boutonsHaut.boutonCaches.classList.add('active');
                    });
                }

                // Synchronisation des boutons "Tout cacher" et "Tout afficher"
                boutonsHaut.boutonCacherTout.addEventListener('click', () => {
                    toggleTousLesProduits(true);
                    boutonsHaut.boutonCacherTout.style.display = '';
                    boutonsHaut.boutonToutAfficher.style.display = 'none';

                    if (hideBas) {
                        boutonsBas.boutonCacherTout.style.display = '';
                        boutonsBas.boutonToutAfficher.style.display = 'none';
                    }
                });

                if (hideBas) {
                    boutonsBas.boutonCacherTout.addEventListener('click', () => {
                        toggleTousLesProduits(true);
                        boutonsHaut.boutonCacherTout.style.display = '';
                        boutonsHaut.boutonToutAfficher.style.display = 'none';
                    });
                }

                boutonsHaut.boutonToutAfficher.addEventListener('click', () => {
                    toggleTousLesProduits(false);
                    boutonsHaut.boutonCacherTout.style.display = 'none';
                    boutonsHaut.boutonToutAfficher.style.display = '';

                    if (hideBas) {
                        boutonsBas.boutonCacherTout.style.display = 'none';
                        boutonsBas.boutonToutAfficher.style.display = '';
                    }
                });

                if (hideBas) {
                    boutonsBas.boutonToutAfficher.addEventListener('click', () => {
                        toggleTousLesProduits(false);
                        boutonsHaut.boutonCacherTout.style.display = 'none';
                        boutonsHaut.boutonToutAfficher.style.display = '';
                    });
                }
            }

            // Création et insertion des boutons en haut et en bas
            const boutonsHaut = creerBoutons();
            const divBoutonsHaut = document.createElement('div');
            divBoutonsHaut.style.marginTop = '5px'; // Réduit l'espace au-dessus des boutons
            divBoutonsHaut.style.marginBottom = '15px'; // Augmente l'espace en dessous des boutons
            divBoutonsHaut.appendChild(boutonsHaut.boutonVisibles);
            divBoutonsHaut.appendChild(boutonsHaut.boutonCaches);
            divBoutonsHaut.appendChild(boutonsHaut.boutonCacherTout);
            divBoutonsHaut.appendChild(boutonsHaut.boutonToutAfficher);

            if (resultats) {
                resultats.after(divBoutonsHaut);
            }

            const boutonsBas = creerBoutons();
            const divBoutonsBas = document.createElement('div');
            divBoutonsBas.style.marginTop = '5px'; // Réduit l'espace au-dessus des boutons
            divBoutonsBas.style.marginBottom = '15px'; // Augmente l'espace en dessous des boutons
            divBoutonsBas.appendChild(boutonsBas.boutonVisibles);
            divBoutonsBas.appendChild(boutonsBas.boutonCaches);
            divBoutonsBas.appendChild(boutonsBas.boutonCacherTout);
            divBoutonsBas.appendChild(boutonsBas.boutonToutAfficher);

            if (vineGrid && hideBas) {
                vineGrid.after(divBoutonsBas);
            }

            // Synchronisation des boutons haut et bas
            synchroniserBoutons(boutonsHaut, boutonsBas, hideBas);

            // Fonction pour cacher ou afficher tous les produits
            function toggleTousLesProduits(cacher) {
                produits.forEach(produit => {
                    const asin = produit.getAttribute('data-asin') || produit.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                    const enrollment = getEnrollment(produit);
                    const hideKey = getAsinEnrollment(asin, enrollment);
                    const etatCacheKey = hideKey + '_c';
                    const etatFavoriKey = asin + '_f';

                    // Vérifie si le produit est en favori avant de changer son état de caché
                    const etatFavori = localStorage.getItem(etatFavoriKey) || '0';
                    if (etatFavori == '0') { // Ne modifie l'état de caché que si le produit n'est pas en favori
                        localStorage.setItem(etatCacheKey, cacher ? '1' : '0');

                        // Sélection de l'icône d'œil dans le produit actuel et mise à jour si l'état de caché change
                        const iconeOeil = produit.querySelector('img[src="' + urlIcone + '"], img[src="' + urlIconeOeil + '"]');
                        if (iconeOeil) {
                            iconeOeil.setAttribute('src', cacher ? urlIconeOeil : urlIcone);
                        }
                    }
                });

                // Force la mise à jour de l'affichage selon le nouveau statut de visibilité
                afficherProduits(cacher);
            }

            //Affiche les produits en fonction du filtre : visible ou caché
            function afficherProduits(afficherVisibles) {
                const produitsFavoris = [];
                produits.forEach(produit => {
                    const asin = produit.getAttribute('data-asin') || produit.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                    const enrollment = getEnrollment(produit);
                    const hideKey = getAsinEnrollment(asin, enrollment);
                    const etatCacheKey = hideKey + '_c';
                    const etatFavoriKey = asin + '_f';

                    //Convertir de la key ASIN à la key ASIN + enrollment, à partir de la 1.14 ou après une synchro
                    const etatCacheOldKey = asin + '_c';
                    const oldValue = localStorage.getItem(etatCacheOldKey);
                    if (oldValue !== null) {
                        localStorage.setItem(etatCacheKey, oldValue);
                        localStorage.removeItem(etatCacheOldKey);
                    }
                    //Fin de conversion

                    //Initialisation des états si non définis
                    let etatCache = localStorage.getItem(etatCacheKey) || '0';
                    let etatFavori = localStorage.getItem(etatFavoriKey) || '0';

                    //Enregistre les valeurs par défaut si nécessaire
                    if (localStorage.getItem(etatCacheKey) === null) {
                        localStorage.setItem(etatCacheKey, etatCache);
                    }
                    if (localStorage.getItem(etatFavoriKey) === null) {
                        localStorage.setItem(etatFavoriKey, etatFavori);
                    }
                    //On test s'il est favori et si on peut le cacher ou non
                    if (etatFavori == '1') {
                        //Les produits favoris sont toujours affichés dans l'onglet "Produits visibles"
                        //et cachés dans l'onglet "Produits cachés"
                        produit.style.display = afficherVisibles ? '' : 'none';
                        produitsFavoris.push(produit);
                    } else {
                        if ((etatCache == '0' && afficherVisibles) || (etatCache == '1' && !afficherVisibles)) {
                            produit.style.display = '';
                        } else {
                            produit.style.display = 'none';
                        }
                    }
                });
                const containerDiv = document.getElementById('vvp-items-grid'); // L'élément conteneur de tous les produits
                if (containerDiv) {
                    produitsFavoris.reverse().forEach(element => {
                        containerDiv.prepend(element);
                    });
                }
                boutonsHaut.boutonVisibles.classList.toggle('active', afficherVisibles); // Active ou désactive le bouton des produits visibles
                boutonsBas.boutonVisibles.classList.toggle('active', afficherVisibles);
                boutonsHaut.boutonCaches.classList.toggle('active', !afficherVisibles); // Active ou désactive le bouton des produits cachés
                boutonsBas.boutonCaches.classList.toggle('active', !afficherVisibles);
                // Gestion de l'affichage des boutons "Cacher tout" et "Tout afficher"
                boutonsHaut.boutonCacherTout.style.display = afficherVisibles ? '' : 'none';
                boutonsBas.boutonCacherTout.style.display = afficherVisibles ? '' : 'none';
                boutonsHaut.boutonToutAfficher.style.display = !afficherVisibles ? '' : 'none';
                boutonsBas.boutonToutAfficher.style.display = !afficherVisibles ? '' : 'none';
            }

            produits.forEach(produit => {
                const asin = produit.getAttribute('data-asin') || produit.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                const enrollment = getEnrollment(produit);
                const hideKey = getAsinEnrollment(asin, enrollment);
                const etatCacheKey = hideKey + '_c';
                const etatFavoriKey = asin + '_f';
                const iconeOeil = document.createElement('img');

                const etatCache = localStorage.getItem(etatCacheKey) || '0';
                iconeOeil.setAttribute('src', etatCache === '1' ? urlIconeOeil : urlIcone);
                if (cssEnabled || mobileEnabled) {
                    iconeOeil.style.cssText = 'position: absolute; top: 0px; right: 1px; cursor: pointer; width: 35px; height: 35px; z-index: 10;';
                } else {
                    iconeOeil.style.cssText = 'position: absolute; top: 0px; right: 5px; cursor: pointer; width: 35px; height: 35px; z-index: 10;';
                }

                iconeOeil.addEventListener('click', () => {
                    const etatFavoriKey = asin + '_f';
                    const etatFavori = localStorage.getItem(etatFavoriKey) || '0';

                    // Vérifie si le produit n'est pas marqué comme favori avant de changer son état de caché
                    if (etatFavori === '0') {
                        const etatCacheActuel = localStorage.getItem(etatCacheKey);
                        const nouvelEtatCache = etatCacheActuel === '1' ? '0' : '1';
                        localStorage.setItem(etatCacheKey, nouvelEtatCache);

                        // Met à jour l'icône basée sur le nouvel état après le clic
                        iconeOeil.setAttribute('src', etatCacheActuel === '1' ? urlIcone : urlIconeOeil);
                    }

                    // Force la mise à jour de l'affichage selon l'état actuel des filtres
                    afficherProduits(!boutonsHaut.boutonCaches.classList.contains('active'));
                });

                const urlIconeFavoriGris = 'https://pickme.alwaysdata.net/img/coeurgris2.png';
                const urlIconeFavoriRouge = 'https://pickme.alwaysdata.net/img/coeurrouge2.png';
                const iconeFavori = document.createElement('img');

                const etatFavori = localStorage.getItem(etatFavoriKey);
                iconeFavori.setAttribute('src', (etatFavori && etatFavori == '1') ? urlIconeFavoriRouge : urlIconeFavoriGris);
                //On test si on utilise le css alternatif pour bouger l'emplacement du coeur, sinon il est superposé au temps du produit
                if (cssEnabled || mobileEnabled) {
                    //On test si le produit est nouveau
                    if (!storedProducts.hasOwnProperty(asin) || !highlightEnabled) {
                        iconeFavori.style.cssText = 'position: absolute; top: 8px; left: 4px; cursor: pointer; width: 23px; height: 23px; z-index: 10;';
                    } else {
                        iconeFavori.style.cssText = 'position: absolute; top: 25px; left: 4px; cursor: pointer; width: 23px; height: 23px; z-index: 10;';
                    }
                } else {
                    iconeFavori.style.cssText = 'position: absolute; top: 8px; left: 8px; cursor: pointer; width: 23px; height: 23px; z-index: 10;';
                }

                // Gestion du clic sur l'icône de favori
                iconeFavori.addEventListener('click', () => {
                    var etatFavoriActuel = localStorage.getItem(etatFavoriKey) || '0';
                    etatFavoriActuel = etatFavoriActuel === '1' ? '0' : '1';
                    localStorage.setItem(etatFavoriKey, etatFavoriActuel);
                    iconeFavori.setAttribute('src', etatFavoriActuel === '1' ? urlIconeFavoriRouge : urlIconeFavoriGris);

                    if (etatFavoriActuel === '1') {
                        // Si le produit est marqué comme favori, s'assurer qu'il est marqué comme non caché
                        localStorage.setItem(etatCacheKey, '0');
                        produit.style.display = ''; // Assure que le produit est visible
                        // Mettre à jour l'icône de l'œil pour refléter que le produit n'est plus caché
                        const iconeOeil = produit.querySelector('img[src="' + urlIcone + '"], img[src="' + urlIconeOeil + '"]');
                        if (iconeOeil) {
                            iconeOeil.setAttribute('src', urlIcone);
                        }
                    }

                    afficherProduits(!boutonsHaut.boutonCaches.classList.contains('active'));
                });

                produit.style.position = 'relative';
                produit.appendChild(iconeOeil);
                produit.appendChild(iconeFavori);
            });

            // Initialisation de l'affichage par défaut à 'Produits Visibles'
            afficherProduits(true);
        }

        if (hideEnabled && apiOk && !autohideEnabled) {
            // Appeler la fonction pour ajouter les étiquettes de temps
            ajouterIconeEtFonctionCacher();
        }
        // Exécuter la fonction pour ajouter les icônes et les fonctionnalités de cacher
        if (highlightEnabled && apiOk) {
            // Appeler la fonction pour ajouter les étiquettes de temps
            ajouterEtiquetteTemps();
            //S'il y a eu un nouvel objet, alors on met l'image New
        }

        //Suppression footer
        var styleFooter = document.createElement('style');

        styleFooter.textContent = `
#rhf, #rhf-shoveler, .rhf-frame, #navFooter {
  display: none !important;
}
`
        document.head.appendChild(styleFooter);

        //Cacher le header ou non
        if (headerEnabled && apiOk) {
            //Suppression header
            var styleHeader = document.createElement('style');

            styleHeader.textContent = `
body {
  padding-right: 0px !important;
}

#navbar-main, #nav-main, #skiplink {
  display: none;
}

.amzn-ss-wrap {
  display: none !important;
}
`
            document.head.appendChild(styleHeader);
        }
        //Agrandir la fenetre des adresses
        if (fastCmdEnabled && apiOk) {
            var styleAddress = document.createElement('style');

            styleAddress.textContent = `
#a-popover-4 {
    height: 480px !important;
    width: 900px !important;
}
`
            document.head.appendChild(styleAddress);
        }


        //Pour monter la valeur de la taxe
        if (taxValue && apiOk) {
            // Créez une balise <style>
            var style = document.createElement('style');
            // Assurez-vous que le style s'applique correctement en utilisant textContent
            style.textContent = `
		#vvp-product-details-modal--tax-value {
			position: absolute !important;
			top: 20px !important;
			z-index: 101;
			left: 18px;
		}
		`;
            //Ajout du style à la page
            document.head.appendChild(style);
            //Remonter les variantes dans les détails
            if (mobileEnabled) {
                var variationsContainer = document.getElementById('vvp-product-details-modal--variations-container');
                var descriptionExpander = document.getElementById('vvp-product-description-expander');

                //Vérification que les deux éléments existent
                if (variationsContainer && descriptionExpander) {
                    //Déplacer variationsContainer avant descriptionExpander
                    descriptionExpander.parentNode.insertBefore(variationsContainer, descriptionExpander);
                }
            }
        }

        //Affichage alternatif
        if (cssEnabled && apiOk)
        {
            var styleCss = document.createElement('style');

            styleCss.textContent = `

//Catégories
#vvp-browse-nodes-container .parent-node {
  background-color: transparent;
}
#vvp-browse-nodes-container > div:nth-child(odd) {
    background-color: rgb(127 127 127 / 10%) !important;
}
#vvp-browse-nodes-container .parent-node, #vvp-browse-nodes-container .child-node  {
  display: flex !important;
}
#vvp-browse-nodes-container .parent-node a, #vvp-browse-nodes-container .child-node a {
  flex-grow: 1 !important;
}

//Items
.a-container.vvp-body {
  padding: 0px;
  max-width: unset !important;
  min-width: unset !important;
}

#vvp-header ~ .a-section {
  display: none;
}

.vvp-body > * + * {
  margin-top: 0px !important;
}

.vvp-header-links-container {
  margin-right: 0.5rem;
}

#vvp-items-grid, #tab-unavailable, #tab-hidden, #tab-favourite {
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--grid-column-width, 110px), auto)
  ) !important;
  margin-bottom: 0px !important;
}

#vvp-items-grid-container .vvp-item-tile .vvp-item-tile-content {
  width: var(--grid-column-width, 110px) !important;
}

#vvp-items-grid-container .vvp-item-tile .vvp-item-tile-content > * {
  margin: 0 !important;
}

#vvp-items-grid-container .vvp-item-tile .vvp-item-tile-content > img {
  margin-top: 0.5rem !important;
}

.vvp-item-tile,
.a-tab-content {
  border: none !important;
}

#vvp-items-grid
  .vvp-item-tile
  .vvp-item-tile-content
  > .vvp-item-product-title-container {
  height: var(--item-tile-height, 40px) !important;
}

/*  Button */
#vvp-beta-tag {
  display: none;
}

#vvp-search-button,
#vvp-search-text-input {
  border-radius: 0rem !important;
}

#vvp-search-button #vvp-search-button-announce {
  line-height: 1 !important;
}

#vvp-search-button .a-button-inner {
  display: flex;
  align-items: center;
}
`;
            document.head.appendChild(styleCss);
        }
        //Affichage mobile
        if (mobileEnabled && apiOk)
        {
            var mobileCss = document.createElement('style');
            // On calcule si on doit appliquer la hauteur ou non
            var applyHeight = !(extendedEnabled && mobileEnabled);

            mobileCss.textContent = `
#configPopup {
  width: 400px !important;
  height: 600px;
}

#colorPickerPopup, #keyConfigPopup, #favConfigPopup, #notifConfigPopup, #notePopup {
  width: 400px !important;
}

/*#colorPickerPopup {
  width: 400px !important;
  height: 250px !important;
}

#notifConfigPopup {
  width: 400px !important;
  height: 350px !important;
}

#favConfigPopup, #notePopup {
  width: 400px !important;
  height: 550px !important;
}*/

/* Taille dynamique pour mobile */
@media (max-width: 600px) {
  #configPopup {
    width: 90%; /* Prendre 90% de la largeur de l'écran */
    height: 90%;
    margin: 10px auto; /* Ajout d'un peu de marge autour des popups */
  }
}

@media (max-width: 600px) {
  #colorPickerPopup, #keyConfigPopup, #favConfigPopup, #notifConfigPopup, #notePopup {
    width: 90%; /* Prendre 90% de la largeur de l'écran */
    margin: 10px auto; /* Ajout d'un peu de marge autour des popups */
  }
}

:root {
  /*defaults--mostly for dev reference*/
  --default-item-tile-height: 30px;
  --default-grid-column: 90px;
  --default-max-product-title: 100px;
  --default-product-title-text-size: 10px;
  --default-cutoff-background-color: #d1d1d1;

  /*users can define custom  overrides by defining
  --custom-orgin-param-name

  /*item-title-height is the base value for derived items*/
  --item-tile-height: var(
    --custom-item-tile-height,
    var(--default-item-tile-height)
  );

  --calc-grid-column-width: calc(var(--item-tile-height) * 2.75);
  --grid-column-width: var(
    --custom-item-grid-column-width,
    var(--calc-grid-column-width)
  );

  --calc-max-product-title: calc(var(--item-tile-height) * 1.25);
  --max-product-title: var(
    --custom-max-product-title,
    var(--calc-max-product-title)
  );

  --calc-product-title-text-size: calc(var(--item-tile-height) * 0.333);
  --product-title-text-size: var(
    --custom-product-title-text-size,
    var(--calc-product-title-text-size)
  );

  /*used in cutoff.css file, defined here for convenience*/
  --cutoff-background-color: var(
    --custom-cutoff-background-color,
    var(--default-cutoff-background-color)
  );
}

body {
  padding-right: 0px !important;
}

.a-section.vvp-items-button-and-search-container {
  flex-direction: column !important;
}

.vvp-container-right-align {
  margin-top: 10px !important;
  width: 100% !important;
  flex-grow: 1 !important;
}

.a-icon-search {
  display: none;
}

.a-search {
  flex-grow: 1;
}

#vvp-search-text-input {
  width: 100% !important;
}

.a-tabs {
  margin: 0px !important;
}

.a-tabs li a {
  padding: 1rem !important;
}

.nav-mobile.nav-ftr-batmobile {
  display: none;
}

.vvp-tab-set-container
  [data-a-name="vine-items"]
  .a-box-inner
  .vvp-tab-content
  .vvp-items-button-and-search-container {
  margin: 0px !important;
}

#a-page
  > div.a-container.vvp-body
  > div.a-tab-container.vvp-tab-set-container
  > ul {
  margin-bottom: 0px !important;
}

#vvp-header {
  justify-content: center !important;
}

.vvp-body {
  padding: 0px !important;
}

.vvp-header-links-container a,
.a-tab-heading a {
  font-size: 12px !important;
}

#vvp-items-button-container {
  width: 100% !important;
}

#vvp-browse-nodes-container .child-node {
  margin-left: 20px !important;
}

/* STRIPPED CATEGORIES */
#vvp-browse-nodes-container .parent-node {
  background-color: white;
}
#vvp-browse-nodes-container > div:nth-child(odd) {
  background-color: #f3f3f3 !important;
}

#vvp-browse-nodes-container .parent-node,
#vvp-browse-nodes-container .child-node {
  display: flex !important;
}
#vvp-browse-nodes-container .parent-node a,
#vvp-browse-nodes-container .child-node a {
  flex-grow: 1 !important;
}

#vvp-browse-nodes-container > p {
  text-align: right;
}

#vvp-items-button-container .a-button-toggle.a-button {
  margin: 0px !important;
  padding: 0px !important;
  width: calc(100% / 3) !important;
  border-radius: 0px;
}

#vvp-items-button-container .a-button-toggle.a-button a {
  font-size: 12px !important;
  height: 54px;
  display: flex;
  align-items: center;
  padding: 0 !important;
  justify-content: center !important;
}

.vvp-items-container {
  flex-direction: column !important;
}

#vvp-items-grid .vvp-item-tile .vvp-item-tile-content > * {
  margin: 0 !important;
}

#vvp-items-grid .vvp-item-tile .vvp-item-tile-content > img {
  margin-top: 0.5rem !important;
}

.vvp-item-tile,
.a-tab-content {
  border: none !important;
}

.a-button-primary {
  transition: 0.2s !important;
}

.a-button-primary .a-button-inner {
  background-color: transparent !important;
}

.a-button-primary:hover {
  opacity: 0.85 !important;
}

/* Pagination styles */
.a-pagination {
  display: flex !important;
  justify-content: center;
}

.a-pagination li:first-child,
.a-pagination li:last-child {
  color: transparent !important;
  position: relative;
}

.a-pagination li.a-disabled {
  display: none !important;
}

.a-pagination li:first-child a,
.a-pagination li:last-child a {
  display: flex;
  align-content: center;
  position: relative;
  justify-content: center;
}

.a-pagination li:first-child a:before,
.a-pagination li:last-child a:before {
  position: absolute !important;
  color: white !important;
  font-size: 2rem !important;
  line-height: 4rem;
  height: 100%;
  width: 100%;
}

ul.a-pagination li:first-child a,  /* Cible le premier li de la liste, supposant que c'est Précédent */
li:last-child.a-last a {     /* Cible les li avec classe 'a-last', supposant que c'est Suivant */
    font-size: 0;
}

li:first-child a span.larr,  /* Cible le span larr dans le premier li */
li.a-last a span.larr {      /* Cible le span larr dans les li a-last */
    font-size: 16px;
    visibility: visible;
}

.a-pagination li {
  width: 40px !important;
  height: 40px !important;
}
.a-pagination li a {
  padding: 0px !important;
  margin: 0px !important;
  height: 100%;
  line-height: 40px !important;
}

.vvp-details-btn {
  padding: 0.25rem 0 !important;
  margin: 0.25rem 0rem !important;
}

.vvp-details-btn .a-button-text {
  padding: 0.5px 0.25px !important;
}

/* RFY, AFA, AI */
#vvp-items-button--recommended a,
#vvp-items-button--all a,
#vvp-items-button--seller a {
  color: transparent;
}

#vvp-items-button--recommended a::before,
#vvp-items-button--all a::before,
#vvp-items-button--seller a::before {
  color: black !important;
  position: absolute;
  font-size: 20px;
  font-weight: bold;
}

#vvp-items-button--recommended a::before {
  content: "RFY" !important;
}

#vvp-items-button--all a::before {
  content: "AFA" !important;
}

#vvp-items-button--seller a::before {
  content: "AI" !important;
}

/* PRODUCT MODAL */
.vvp-modal-footer #vvp-product-details-modal--back-btn,
.vvp-modal-footer .a-button-discord,
.vvp-modal-footer #vvp-product-details-modal--request-btn {
    margin-bottom: 10px;
}

.a-popover.a-popover-modal.a-declarative.a-popover-modal-fixed-height {
  height: calc(100% - 100px) !important;
  width: 100% !important;
  top: 50px !important;
  right: 0px !important;
  left: 0px !important;
  padding: 0px !important;
}

#vvp-product-details-modal--main {
  flex-direction: column;
}

#vvp-product-details-modal--tax-value {
  position: absolute !important;
  top: 20px !important;
  z-index: 100;
  left: 18px;
}

#vvp-product-details-img-container {
  width: unset !important;
  height: 150px !important;
  display: flex !important;
  justify-content: center !important;
  position: relative !important;
}

#vvp-product-details-img-container img {
  height: 150px !important;
}

/* GHOST ICON */
#vvp-product-details-modal--limited-quantity {
  position: absolute !important;
  bottom: -28px !important;
  z-index: 101 !important;
  right: 8px !important;
  color: transparent !important;
  width: 41.2px !important;
}

#vvp-product-details-modal--limited-quantity::before {
  content: "⌛";
  font-size: 30px;
  text-shadow: 0px 0px 20px #ff0000 !important;
  color: white !important;
}

/* SEARCH BUTTON */
#vvp-beta-tag {
  display: none;
}

#vvp-search-button,
#vvp-search-text-input {
  border-radius: 0rem !important;
}

#vvp-search-button #vvp-search-button-announce {
  line-height: 1 !important;
}

/* COLLAPSABLE CATEGORIES */
.vvp-items-container {
  margin: 0rem !important;
}

#vvp-browse-nodes-container {
  margin: 1rem 0rem !important;
}

#vvp-browse-nodes-container:not(:hover) p,
#vvp-browse-nodes-container:not(:hover) .parent-node,
#vvp-browse-nodes-container:not(:hover) .child-node,
#vvp-browse-nodes-container:not(:hover) #info-container {
  display: none !important;
}

#vvp-browse-nodes-container:not(:hover):before {
  content: "Catégories";
  padding: 0.5rem;
  line-height: 3rem;
  color: #fff;
}

#vvp-browse-nodes-container:not(:hover) {
  background-color: #303333;
}

/* PRODUCT AND REVIEW PAGES */
#vvp-product-details-img-container,
#vvp-product-details-img-container img {
  height: 75px;
}

#vvp-browse-nodes-container,
#vvp-browse-nodes-container .parent-node,
#vvp-browse-nodes-container .child-node {
  width: unset !important;
}

.vvp-reviews-table .vvp-reviews-table--row,
.vvp-orders-table .vvp-orders-table--row {
  display: flex;
  flex-wrap: wrap;
}

.vvp-reviews-table tbody,
.vvp-orders-table tbody {
  display: flex !important;
  flex-wrap: wrap;
}

.vvp-reviews-table--heading-row,
.vvp-orders-table--heading-row {
  display: none !important;
}

.vvp-reviews-table td,
.vvp-orders-table td {
  padding-top: 0px !important;
  padding-bottom: 0px !important;
}

.vvp-reviews-table td.vvp-reviews-table--image-col,
.vvp-orders-table td.vvp-orders-table--image-col {
  padding-top: 10px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.vvp-reviews-table td.vvp-reviews-table--image-col img,
.vvp-orders-table td.vvp-orders-table--image-col img {
  height: 75px;
}

.vvp-reviews-table--actions-col,
.vvp-orders-table--actions-col {
  width: 100% !important;
  display: flex !important;
  align-items: center !important;
}

#vvp-items-grid, #tab-unavailable, #tab-hidden, #tab-favourite {
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--grid-column-width), auto)
  ) !important;
}

#vvp-items-grid-container .vvp-item-tile .vvp-item-tile-content {
  width: var(--grid-column-width) !important;
}

#vvp-items-grid-container
  .vvp-item-tile
  .vvp-item-tile-content
  > .vvp-item-product-title-container {
  ${applyHeight ? 'height: var(--max-product-title) !important;' : ''}
  font-size: var(--product-title-text-size) !important;
}

#vvp-items-grid-container
  .vvp-item-tile
  .vvp-item-tile-content
  > .vvp-item-product-title-container
  .a-truncate {
  max-height: var(--max-product-title) !important;
}
`;
            document.head.appendChild(mobileCss);
        }

        //Gestion des thèmes couleurs
        //Thème
        if (savedTheme != "default") {
            if (mobileEnabled) {
                loadCSS(baseURLCSS + savedTheme + '-theme-mobile.css');
            } else {
                loadCSS(baseURLCSS + savedTheme + '-theme.css');
            }
        }
        //Boutons
        if (savedTheme == "dark" && savedButtonColor == "default") {
            loadCSS(baseURLCSS + 'yellow-buttons.css');
        } else if (savedButtonColor != "default") {
            loadCSS(baseURLCSS + savedButtonColor + '-buttons.css');
        }
        //End

        var API_TOKEN = GM_getValue("apiToken");

        function addGlobalStyle(css) {
            var head, style;
            head = document.getElementsByTagName('head')[0];
            if (!head) {
                return;
            }
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            head.appendChild(style);
        }

        addGlobalStyle(`.a-button-discord > .a-button-text { padding-left: 6px; }`);
        addGlobalStyle(`.a-button-discord-icon { background-image: url(https://m.media-amazon.com/images/S/sash/Gt1fHP07TsoILq3.png); content: ""; padding: 10px 10px 10px 10px; background-size: 512px 512px; background-repeat: no-repeat; margin-left: 10px; vertical-align: middle; }`);
        addGlobalStyle(`.a-button-discord.mobile-vertical { margin-top: 7px; margin-left: 0px; }`);

        //PickMe add
        //Récupérer l'enrollment
        function getEnrollment(element) {
            const recommendationId = element.getAttribute('data-recommendation-id');
            let enrollment = null;

            if (recommendationId) {
                //Découper la chaîne pour isoler la dernière partie après le dernier '#'
                const parts = recommendationId.split('#');
                enrollment = parts[parts.length - 1];
                //Supprimer "vine.enrollment." si présent
                if (enrollment.startsWith('vine.enrollment.')) {
                    enrollment = enrollment.replace('vine.enrollment.', '');
                }
            }
            return enrollment;
        }

        //Générer la combinaison ASIN et enrollment
        function getAsinEnrollment(asin, enrollment) {
            const enrollmentPart = enrollment.split('-')[1];
            return asin + enrollmentPart;
        }

        const urlParams = new URLSearchParams(window.location.search);

        let valeurQueue = urlParams.get('queue');
        const valeurPn = parseInt(urlParams.get('pn'), 10) || 0; // Utilisez 0 comme valeur par défaut si pn n'est pas défini
        const valeurCn = parseInt(urlParams.get('cn'), 10) || 0; // Utilisez 0 comme valeur par défaut si cn n'est pas défini
        let valeurPage = urlParams.get('page') || '1'; // '1' est utilisé comme valeur par défaut
        // Vérifiez et ajustez valeurQueue en fonction de valeurPn
        if (valeurQueue === 'encore') {
            if (valeurPn > 0) {
                valeurQueue = valeurPn.toString();
            }
        }
        // Ajustez valeurPage en fonction de valeurCn, si nécessaire
        if (valeurCn > 0) {
            valeurPage = valeurCn.toString();
        }

        const items = document.querySelectorAll('.vvp-item-tile');
        const listElements = [];
        const listElementsOrder = [];

        let elementsToPrepend = [];
        items.forEach(element => {
            //Récupérer le texte à partir du lien dans .vvp-item-product-title-container
            const linkElement = element.querySelector('.vvp-item-product-title-container > a.a-link-normal');
            const title = linkElement ? linkElement.innerText.trim() : null;

            //Récupérer l'URL de l'image
            const imgElement = element.querySelector('img');
            const imgUrl = imgElement ? imgElement.src : null;

            //Récupérer l'enrollment
            let enrollment = getEnrollment(element);

            //Récupérer l'URL du produit
            const productUrl = linkElement ? linkElement.href : null;

            // Ajouter les données récupérées dans le tableau
            listElements.push({
                title: title,
                imgUrl: imgUrl,
                productUrl: productUrl,
                enrollment: enrollment
            });
            listElementsOrder.push(productUrl);
            if ((firsthlEnabled || highlightEnabled) && apiOk) {
                const asin = linkElement.href.split('/dp/')[1].split('/')[0]; // Extrait l'ASIN du produit
                //const containerDiv = document.getElementById('vvp-items-grid'); // L'élément conteneur de tous les produits
                //Vérifier si le produit existe déjà dans les données locales
                const enrollmentKey = getAsinEnrollment(asin, enrollment);
                if (!storedProducts.hasOwnProperty(asin)) {
                    //Si le produit n'existe pas, l'ajouter aux données locales avec la date courante
                    const currentDate = new Date().toISOString(); // Obtenir la date courante en format ISO

                    storedProducts[asin] = {
                        added: true, // Marquer le produit comme ajouté
                        enrollmentKey: enrollmentKey,
                        dateAdded: currentDate // Stocker la date d'ajout
                    };

                    //Appliquer la mise en surbrillance au div parent
                    if (highlightEnabled) {
                        element.style.backgroundColor = highlightColor;
                        imgNew = true;
                    }
                    //On stocke les produits qu'on va devoir remonter
                    if (firsthlEnabled) {
                        //containerDiv.prepend(element);
                        elementsToPrepend.push(element);
                        imgNew = true;
                    }
                } else if (storedProducts[asin] && storedProducts[asin].enrollmentKey != enrollmentKey) {
                    storedProducts[asin].enrollmentKey = enrollmentKey;
                    if (highlightEnabled) {
                        element.style.backgroundColor = highlightColorRepop;
                        imgNew = true;
                    }
                    if (firsthlEnabled) {
                        elementsToPrepend.push(element);
                        imgNew = true;
                    }
                }
            }
            //Modifier le texte du bouton détails
            changeButtonProduct(element);
        });

        GM_setValue("storedProducts", JSON.stringify(storedProducts)); //Sauvegarder les changements (après le précédent traitement)

        //On remonte les produits dans leur ordre initial
        if (firsthlEnabled && apiOk) {
            const containerDiv = document.getElementById('vvp-items-grid'); // L'élément conteneur de tous les produits
            if (containerDiv) {
                elementsToPrepend.reverse().forEach(element => {
                    containerDiv.prepend(element);
                });
            }
        }

        //Bouton de commandes rapides
        if (fastCmd && apiOk) {
            addFastCmd();
        }

        if (imgNew && callUrlEnabled && apiOk && callUrl && valeurQueue == "potluck") {
            appelURL();
        }

        //Durée maximale de l'ancienneté en millisecondes (ici: 1 jour)
        const MAX_c_AGE = 24 * 60 * 60 * 1000;

        //Fonction pour vérifier si une page est potentiellement chargée depuis un cache ancien
        function isPageCachedOld() {
            //Récupère la date de dernière visite stockée
            const lastVisit = GM_getValue('lastVisit', null);
            const now = new Date().getTime();

            if (lastVisit) {
                const lastVisitDate = new Date(lastVisit);
                const age = now - lastVisitDate.getTime();

                //Si l'âge est supérieur à MAX_c_AGE, on considère la page comme obsolète
                if (age > MAX_c_AGE) {
                    GM_setValue('lastVisit', now);
                    return true;
                }
            }

            //Met à jour la date de dernière visite
            GM_setValue('lastVisit', now);
            return false;
        }

        if (listElements.length > 0 && !isPageCachedOld()) {
            sendDatasToAPI(listElements);
            if (ordersInfos && ordersEnabled && window.location.href.startsWith("https://www.amazon.fr/vine/vine-items?queue=")) {
                ordersPost(listElementsOrder);
            }
        }

        function resetEtMiseAJour() {
            imgNew = true;
            updateCat(false);
        }

        //Fleche pour cacher le menu
        if (!mobileEnabled && apiOk) {

            const styles = `
				.hidden {
					display: none;
				}
				.arrow {
					cursor: pointer;
					transition: transform 0.3s ease;
					width: 20px;
					height: 20px;
					vertical-align: middle;
                    margin-right:2px;
				}
				.rotate-180 {
					transform: rotate(180deg);
				}
			`;

            // Ajouter les styles à la page
            const styleSheet = document.createElement("style");
            styleSheet.type = "text/css";
            styleSheet.innerText = styles;
            document.head.appendChild(styleSheet);

            // Ajouter la flèche à la page
            var imageUrl = "https://pickme.alwaysdata.net/img/arrowyellowleft.png";
            if (savedButtonColor == "blue") {
                imageUrl = "https://pickme.alwaysdata.net/img/arrowleft.png";
            } else if (savedButtonColor == "black") {
                imageUrl = "https://pickme.alwaysdata.net/img/arrowdarkleft.png";
            } else if (savedButtonColor == "pink") {
                imageUrl = "https://pickme.alwaysdata.net/img/arrowpinkleft.png";
            } else if (savedButtonColor == "purple") {
                imageUrl = "https://pickme.alwaysdata.net/img/arrowpurpleleft.png";
            } else if (savedButtonColor == "red") {
                imageUrl = "https://pickme.alwaysdata.net/img/arrowredleft.png";
            } else if (savedButtonColor == "green") {
                imageUrl = "https://pickme.alwaysdata.net/img/arrowgreenleft.png";
            } else if (savedButtonColor == "orange") {
                imageUrl = "https://pickme.alwaysdata.net/img/arroworangeleft.png";
            }
            const arrow = $('<img src="' + imageUrl + '" alt="Toggle Menu" id="toggle-arrow" class="arrow">');

            $('#vvp-browse-nodes-container').after(arrow);

            // Sélectionner le menu
            const $menu = $('#vvp-browse-nodes-container');
            const $arrow = $('#toggle-arrow');

            // Charger l'état initial du menu
            const isMenuHidden = GM_getValue('isMenuHidden', false);
            if (isMenuHidden) {
                $menu.addClass('hidden');
                $arrow.addClass('rotate-180');
            }

            // Gérer le clic sur la flèche
            $arrow.on('click', function() {
                $menu.toggleClass('hidden');
                $arrow.toggleClass('rotate-180');

                // Enregistrer l'état actuel du menu
                GM_setValue('isMenuHidden', $menu.hasClass('hidden'));
            });
        }
        //End

        //Affichage de la différence des catégories
        function updateCat(firstLoad = true) {
            //Fonction pour extraire le nombre d'éléments par catégorie
            const extraireNombres = () => {
                const categories = document.querySelectorAll('.parent-node');
                const resultats = {};
                categories.forEach(cat => {
                    const nomElement = cat.querySelector('a');
                    const nombreElement = cat.querySelector('span');
                    if (nomElement && nombreElement) {
                        const nom = nomElement.textContent.trim();
                        const nombre = parseInt(nombreElement.textContent.trim().replace(/[()]/g, ''), 10);
                        resultats[nom] = isNaN(nombre) ? 0 : nombre;
                    }
                });
                return resultats;
            };

            const extraireNombreTotal = () => {
                const texteTotalElement = document.querySelector('#vvp-items-grid-container > p');
                if (texteTotalElement) {
                    const texteTotal = texteTotalElement.textContent.trim();
                    const match = texteTotal.match(/sur (\d+[\s\u00A0\u202F\u2009]*\d*)/);
                    if (match) {
                        const nombreTotal = parseInt(match[1].replace(/[\s\u00A0\u202F\u2009]/g, ''), 10);
                        return isNaN(nombreTotal) ? 0 : nombreTotal;
                    }
                }
                return 0;
            };

            //Comparer le nombre total actuel avec celui stocké et mettre à jour l'affichage
            const comparerEtAfficherTotal = (nouveauTotal) => {
                const ancienTotal = parseInt(localStorage.getItem('nombreTotalRésultats') || '0', 10);
                const differenceTotal = nouveauTotal - ancienTotal;
                if (differenceTotal !== 0 && firstLoad) {
                    const containerTotal = document.querySelector('#vvp-items-grid-container > p');
                    if (containerTotal) {
                        const spanTotal = document.createElement('span');
                        spanTotal.textContent = ` (${differenceTotal > 0 ? '+' : ''}${differenceTotal})`;
                        spanTotal.style.color = differenceTotal > 0 ? 'green' : 'red';
                        containerTotal.appendChild(spanTotal);
                    }
                }
                if (imgNew && window.location.href.includes("queue=encore")) {
                    localStorage.setItem('nombreTotalRésultats', JSON.stringify(nouveauTotal));
                }
            }

            //Comparer les nombres actuels avec ceux stockés et mettre à jour l'affichage
            const comparerEtAfficher = (nouveauxNombres) => {
                const anciensNombres = JSON.parse(localStorage.getItem('nombresCatégories') || '{}');

                Object.keys(nouveauxNombres).forEach(nom => {
                    const nouveauxNombresVal = nouveauxNombres && nouveauxNombres[nom] ? nouveauxNombres[nom] : 0;
                    const anciensNombresVal = anciensNombres && anciensNombres[nom] ? anciensNombres[nom] : 0;
                    const difference = nouveauxNombresVal - anciensNombresVal;
                    if (difference !== 0 && firstLoad) {
                        const elementCategorie = [...document.querySelectorAll('.parent-node')]
                        .find(el => el.querySelector('a').textContent.trim() === nom);
                        if (elementCategorie) { // Vérifier que l'élément existe avant de continuer
                            const span = document.createElement('span');
                            span.textContent = ` (${difference > 0 ? '+' : ''}${difference})`;
                            span.style.color = difference > 0 ? 'green' : 'red';
                            elementCategorie.appendChild(span);
                        }
                    }
                });

                //Mise à jour du stockage local avec les nouveaux nombres si on a vu un nouvel objet uniquement
                if (imgNew && window.location.href.includes("queue=encore")) {
                    localStorage.setItem('nombresCatégories', JSON.stringify(nouveauxNombres));
                }
                if (!firstLoad) {
                    window.location.reload();
                }
            };

            const nombresActuels = extraireNombres();
            comparerEtAfficher(nombresActuels);
            const urlActuelle = new URL(window.location.href);
            const paramPn = urlActuelle.searchParams.get("pn");
            if (paramPn === null || paramPn === '') {
                const nombreTotalActuel = extraireNombreTotal();
                comparerEtAfficherTotal(nombreTotalActuel);
            }
        }

        if (window.location.href.includes("queue=encore") && catEnabled && apiOk) {
            updateCat();
            // Création du bouton "Reset"
            const boutonReset = document.createElement('button');
            boutonReset.textContent = 'Reset';
            boutonReset.classList.add('bouton-reset');
            boutonReset.addEventListener('click', resetEtMiseAJour);
            //boutonReset.addEventListener('click', () => syncProducts(false));

            // Sélection du conteneur où insérer le bouton "Reset"
            const conteneur = document.querySelector('#vvp-browse-nodes-container > p');
            if (conteneur) {
                conteneur.appendChild(boutonReset);
            }
        }

        //Affichage de l'image New
        if (imgNew) {
            // Créer l'élément image
            const imageElement = document.createElement('img');
            imageElement.src = 'https://pickme.alwaysdata.net/img/new-10785605-2-2.png';
            imageElement.style.cssText = 'height: 15px; width: 35px; margin-left: 10px; vertical-align: middle;';

            // Trouver l'élément après lequel insérer l'image
            // Cela suppose que le paragraphe avec les résultats est toujours présent et correctement positionné
            const paragraphResults = document.querySelector('#vvp-items-grid-container > p');

            if (paragraphResults) {
                // Insérer l'image après le paragraphe des résultats
                paragraphResults.appendChild(imageElement);
            }
        }

        const urlData = window.location.href.match(/(amazon\..+)\/vine\/vine-items(?:\?queue=)?(encore|last_chance|potluck)?.*?(?:&page=(\d+))?$/); // Country and queue type are extrapolated from this
        //End
        const MAX_COMMENT_LENGTH = 900;
        const ITEM_EXPIRY = 7776000000; // 90 days in ms
        const PRODUCT_IMAGE_ID = /.+\/(.*)\._SS[0-9]+_\.[a-z]{3,4}$/;
        // Icons for the Share button
        const btn_discordSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -15 130 130" style="height: 29px; padding: 4px 0px 4px 10px;">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" style="fill: #5865f2;"></path>
    </svg>`;
        const btn_loadingAnim = `<span class="a-spinner a-spinner-small" style="margin-left: 10px;"></span>`;
        const btn_checkmark = `<span class='a-button-discord-icon a-button-discord-success a-hires' style='background-position: -83px -116px;'></span>`;
        const btn_warning = `<span class='a-button-discord-icon a-button-discord-warning a-hires' style='background-position: -83px -96px;'></span>`;
        const btn_error = `<span class='a-button-discord-icon a-button-discord-error a-hires' style='background-position: -451px -422px;'></span>`;
        const btn_info = `<span class='a-button-discord-icon a-button-discord-info a-hires' style='background-position: -257px -354px;'></span>`;

        //The modals related to error messages
        const errorMessages = document.querySelectorAll('#vvp-product-details-error-alert, #vvp-out-of-inventory-error-alert');

        //PickMe add
        function purgeStoredProducts(purgeAll = false) {
            //Charger les produits stockés ou initialiser comme un objet vide si aucun produit n'est trouvé
            var storedProducts = JSON.parse(GM_getValue("storedProducts", '{}'));
            const currentDate = new Date().getTime(); // Obtenir la date et l'heure courantes en millisecondes

            //Parcourir les clés (ASIN) dans storedProducts
            for (const asin in storedProducts) {
                if (storedProducts.hasOwnProperty(asin)) { //Vérification pour éviter les propriétés héritées
                    const cacheKey = asin + '_c';
                    const favoriKey = asin + '_f';
                    if (purgeAll) {
                        // Purger le produit sans vérifier la date
                        delete storedProducts[asin];
                    } else {
                        // Purger le produit en fonction de la date d'expiration
                        const productDateAdded = new Date(storedProducts[asin].dateAdded).getTime(); // Convertir la date d'ajout en millisecondes
                        if (currentDate - productDateAdded >= ITEM_EXPIRY) { //Vérifier si le produit a expiré
                            if (storedProducts[asin] && storedProducts[asin].enrollmentKey) {
                                const hideKey = storedProducts[asin].enrollmentKey + '_c';
                                localStorage.removeItem(hideKey);
                            }
                            //On supprime l'ancienne clé pour cacher pour l'instant (utilisé avant la 1.14)
                            localStorage.removeItem(cacheKey);
                            localStorage.removeItem(favoriKey);
                            delete storedProducts[asin]; // Supprimer le produit expiré
                        }
                    }
                }
            }

            // Sauvegarder les modifications apportées à storedProducts
            GM_setValue("storedProducts", JSON.stringify(storedProducts));
        }

        function purgeHiddenObjects(purgeAll = false) {
            let purgeFavorites = false;
            let purgeHidden = false;

            // Poser la question pour les produits cachés et les favoris si purgeAll est vrai
            if (purgeAll) {
                purgeHidden = confirm("Êtes-vous sur de vouloir supprimer tous les produits cachés ?");
                purgeFavorites = confirm("Voulez-vous supprimer tous les favoris ?");
            }

            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                const isCacheKey = key.includes('_c');
                const isFavoriKey = key.includes('_f');
                if (isCacheKey || isFavoriKey) {
                    if (isCacheKey && purgeHidden) {
                        localStorage.removeItem(key);
                    } else if (isFavoriKey && purgeFavorites) {
                        localStorage.removeItem(key);
                    }
                }
            }
            const button = document.getElementById('purgeAllItems');
            button.innerHTML = `Purger la mémoire ${afficherMemoireLocalStorage()}`;
        }

        function purgeAllItems() {
            const userHideAll = confirm("Voulez-vous également cacher tous les produits ? OK pour oui, Annuler pour non.");
            const button = document.getElementById('purgeAllItems');

            //Étape 1 : Mise à jour initiale du bouton
            button.innerHTML = `En cours (0%)`;

            //Étape 2 : Purger les favoris et les caches
            setTimeout(() => {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    const isCacheKey = key.includes('_c') || key.includes('_cache');
                    const isFavoriKey = key.includes('_f') || key.includes('_favori');

                    if (isCacheKey || isFavoriKey) {
                        // Si c'est une clé favori (_f), vérifier la valeur
                        if (isFavoriKey && localStorage.getItem(key) === '1') {
                            continue; // Ne pas supprimer si la valeur vaut '1'
                        }

                        localStorage.removeItem(key);
                    }
                }
                button.innerHTML = `En cours (33%)`;

                //Étape 3 : Purger la surbrillance
                setTimeout(() => {
                    //Charger les produits stockés ou initialiser comme un objet vide si aucun produit n'est trouvé
                    var storedProducts = JSON.parse(GM_getValue("storedProducts", '{}'));

                    //Parcourir les clés (ASIN) dans storedProducts
                    for (const asin in storedProducts) {
                        if (storedProducts.hasOwnProperty(asin)) { // Vérification pour éviter les propriétés héritées
                            // Purger le produit sans vérifier la date
                            delete storedProducts[asin];
                        }
                    }

                    //Sauvegarder les modifications apportées à storedProducts
                    GM_setValue("storedProducts", JSON.stringify(storedProducts));

                    button.innerHTML = `En cours (66%)`;

                    //Étape 4 : Synchronisation des produits
                    setTimeout(() => {
                        syncProducts(false, userHideAll, false);

                        button.innerHTML = `Terminé (100%)`;

                        //Étape 5 : Mise à jour finale du bouton
                        setTimeout(() => {
                            button.innerHTML = `Purger la mémoire ${afficherMemoireLocalStorage()}`;
                        }, 1000); //1 seconde avant la mise à jour finale

                    }, 1000); //1 seconde avant de passer à la synchronisation des produits

                }, 1000); //1 seconde avant de purger la surbrillance

            }, 1000); //1 seconde avant de purger les favoris et les caches
        }

        //On purge les anciens produits
        purgeStoredProducts();

        //On affiche les pages en haut si l'option est activée
        if (paginationEnabled && apiOk) {
            //Sélection du contenu HTML du div source
            const sourceElement = document.querySelector('.a-text-center');
            //Vérifier si l'élément source existe
            if (sourceElement) {

                /*//Ajout de pages
                const numberOfAdditionalPages = 3;
                const url = new URL(window.location);
                const params = url.searchParams;
                const currentPage = parseInt(params.get('page') || '1', 10);
                let ellipsisElement = null;
                //Trouver ou créer le conteneur de pagination si nécessaire
                let paginationContainer = sourceElement.querySelector('.a-pagination');
                if (!paginationContainer) {
                    paginationContainer = document.createElement('ul');
                    paginationContainer.className = 'a-pagination';
                    sourceElement.appendChild(paginationContainer);
                }
                const paginationItems = paginationContainer.querySelectorAll('li.a-disabled[aria-disabled="true"]');
                paginationItems.forEach(function(item) {
                    if (item.textContent.trim() === '...') {
                        ellipsisElement = item;
                    }
                });

                // Si l'élément "..." est trouvé, insérer les pages supplémentaires avant lui
                if (ellipsisElement) {
                    // Boucle pour créer et insérer les pages supplémentaires
                    for (let i = 4; i < 4 + numberOfAdditionalPages; i++) {
                        const pageLi = document.createElement('li');
                        if (i === currentPage) {
                            pageLi.className = 'a-selected';
                            pageLi.innerHTML = `<a href="?page=${i}" aria-current="page">${i}</a>`;
                        } else {
                            pageLi.className = 'a-normal';
                            pageLi.innerHTML = `<a href="?page=${i}">${i}</a>`;
                        }
                        // Insérer le nouvel élément avant l'élément "..."
                        paginationContainer.insertBefore(pageLi, ellipsisElement);
                    }
                }
                //Maintenant que l'élément source a été mis à jour, copier son contenu HTML
                const sourceContent = sourceElement.outerHTML;

                //Création d'un nouveau div pour le contenu copié
                const newDiv = document.createElement('div');
                newDiv.innerHTML = sourceContent;
                newDiv.style.textAlign = 'center'; // Centrer le contenu
                newDiv.style.paddingBottom = '10px'; // Ajouter un petit espace après

                //Sélection du div cible où le contenu sera affiché
                const targetDiv = document.getElementById('vvp-items-grid-container');

                //S'assurer que le div cible existe avant d'insérer le nouveau div
                if (targetDiv) {
                    //Insertion du nouveau div au début du div cible
                    targetDiv.insertBefore(newDiv, targetDiv.firstChild);
                }*/

                //Maintenant que l'élément source a été mis à jour, copier son contenu HTML
                const sourceContent = sourceElement.outerHTML;

                //Création d'un nouveau div pour le contenu copié
                const newDiv = document.createElement('div');
                newDiv.innerHTML = sourceContent;
                newDiv.style.textAlign = 'center'; // Centrer le contenu
                newDiv.style.paddingBottom = '10px'; // Ajouter un petit espace après

                //Sélection du div cible où le contenu sera affiché
                const targetDiv = document.getElementById('vvp-items-grid-container');

                //S'assurer que le div cible existe avant d'insérer le nouveau div
                if (targetDiv) {
                    //Insertion du nouveau div au début du div cible
                    targetDiv.insertBefore(newDiv, targetDiv.firstChild);
                }
                //Trouver ou créer le conteneur de pagination si nécessaire
                let paginationContainer = sourceElement.querySelector('.a-pagination');
                if (!paginationContainer) {
                    paginationContainer = document.createElement('ul');
                    paginationContainer.className = 'a-pagination';
                    sourceElement.appendChild(paginationContainer);
                }

                //Ajout du bouton "Aller à" en haut et en bas
                if (window.location.href.includes("queue=encore")) {
                    // Création du bouton "Aller à la page X"
                    const gotoButtonUp = document.createElement('li');
                    gotoButtonUp.className = 'a-last'; //Utiliser la même classe que le bouton "Suivant" pour le style
                    gotoButtonUp.innerHTML = `<a id="goToPageButton">${pageX}<span class="a-letter-space"></span><span class="a-letter-space"></span></a>`;

                    // Ajouter un événement click au bouton "Aller à"
                    gotoButtonUp.querySelector('a').addEventListener('click', function() {
                        askPage();
                    });

                    // Création du bouton "Aller à la page X"
                    const gotoButton = document.createElement('li');
                    gotoButton.className = 'a-last'; //Utiliser la même classe que le bouton "Suivant" pour le style
                    gotoButton.innerHTML = `<a id="goToPageButton">${pageX}<span class="a-letter-space"></span><span class="a-letter-space"></span></a>`;

                    // Ajouter un événement click au bouton "Aller à"
                    gotoButton.querySelector('a').addEventListener('click', function() {
                        askPage();
                    });
                    //On insère Page X en début de page
                    newDiv.querySelector('.a-pagination').insertBefore(gotoButtonUp, newDiv.querySelector('.a-last'));
                    //On insère en bas de page
                    paginationContainer.insertBefore(gotoButton, paginationContainer.querySelector('.a-last'));
                }
            }
        }
        //Menu PickMe
        // Ajoute le style CSS pour la fenêtre popup flottante
        const styleMenu = document.createElement('style');
        styleMenu.type = 'text/css';
        styleMenu.innerHTML = `
#configPopup, #keyConfigPopup, #favConfigPopup, #colorPickerPopup, #notifConfigPopup, #notePopup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 500px; /* Ajusté pour mieux s'adapter aux deux colonnes de checkbox */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  cursor: auto;
  border: 2px solid #ccc; /* Ajout d'un contour */
  overflow: auto; /* Ajout de défilement si nécessaire */
  resize: both; /* Permet le redimensionnement horizontal et vertical */
  max-height: 95vh;
}

.api-token-container label, .theme-container label {
  margin-bottom: 0 !important;
  display: block !important;
}

.full-width {
  flex-basis: 100%;
}

#configPopup h2, #configPopup label, #keyConfigPopup h2, #colorPickerPopup h2, #notifConfigPopup h2 {
  color: #333;
  margin-bottom: 20px;
}

#configPopup h2 {
  cursor: grab;
  font-size: 1.5em;
  text-align: center;
}

#keyConfigPopup h2, #favConfigPopup h2, #colorPickerPopup h2, #notifConfigPopup h2, #notePopup h2 {
  font-size: 1.5em;
  text-align: center;
}

#configPopup label, #keyConfigPopup label, #favConfigPopup label, #notifConfigPopup label, #notePopup label {
  display: flex;
  align-items: center;
}

#configPopup label input[type="checkbox"], #notifConfigPopup label input[type="checkbox"] {
  margin-right: 10px;
}

#configPopup .button-container,
#configPopup .checkbox-container,
#notifConfigPopup .button-container,
#notifConfigPopup .checkbox-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

#configPopup .button-container button,
#configPopup .checkbox-container label,
#notifConfigPopup .button-container button,
#notifConfigPopup .checkbox-container label {
  margin-bottom: 10px;
  flex-basis: 48%; /* Ajusté pour uniformiser l'apparence des boutons et des labels */
}

#configPopup button, #keyConfigPopup button, #favConfigPopup button, #notifConfigPopup button, #notePopup button {
  padding: 5px 10px;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

#configPopup button:not(.full-width), #keyConfigPopup button:not(.full-width), #favConfigPopup button:not(.full-width), #colorPickerPopup button:not(.full-width), #notifConfigPopup button:not(.full-width), #notePopup button:not(.full-width) {
  margin-right: 1%;
  margin-left: 1%;
}

#configPopup button.full-width {
  flex-basis: 48%;
  margin-right: 1%;
  margin-left: 1%;
}

#configPopup button:hover {
  background-color: #e8e8e8;
}

#configPopup button:active {
  background-color: #ddd;
}
#configPopup label.disabled {
  color: #ccc;
}

#configPopup label.disabled input[type="checkbox"] {
  cursor: not-allowed;
}
#saveConfig, #closeConfig, #saveKeyConfig, #closeKeyConfig, #syncFavConfig, #saveFavConfig, #closeFavConfig, #saveColor, #closeColor, #saveNotifConfig, #closeNotifConfig, #saveNote, #closeNote {
  padding: 8px 15px !important; /* Plus de padding pour un meilleur visuel */
  margin-top !important: 5px;
  border-radius: 5px !important; /* Bordures légèrement arrondies */
  font-weight: bold !important; /* Texte en gras */
  border: none !important; /* Supprime la bordure par défaut */
  color: white !important; /* Texte en blanc */
  cursor: pointer !important;
  transition: background-color 0.3s ease !important; /* Transition pour l'effet au survol */
}

#saveConfig, #saveKeyConfig, #saveFavConfig, #saveColor, #saveNotifConfig, #saveNote {
  background-color: #4CAF50 !important; /* Vert pour le bouton "Enregistrer" */
}

#syncFavConfig {
  background-color: #2196F3 !important; /* Bleu pour le bouton "Synchroniser" */
}

#closeConfig, #closeKeyConfig, #closeFavConfig, #closeColor, #closeNotifConfig, #closeNote {
  background-color: #f44336 !important; /* Rouge pour le bouton "Fermer" */
}

#saveConfig:hover, #saveKeyConfig:hover, #saveFavConfig:hover, #saveColor:hover, #saveNotifConfig:hover, #saveNote:hover {
  background-color: #45a049 !important; /* Assombrit le vert au survol */
}

#syncFavConfig:hover {
  background-color: #1976D2 !important; /* Assombrit le bleu au survol */
}

#syncFavConfig:disabled {
  background-color: #B0BEC5; /* Couleur grise pour le bouton désactivé */
  color: #FFFFFF; /* Couleur du texte, si nécessaire */
  cursor: not-allowed !important; /* Change le curseur pour indiquer que le bouton est désactivé */
  opacity: 0.6; /* Optionnel : rend le bouton semi-transparent */
}

#closeConfig:hover, #closeKeyConfig:hover, #closeFavConfig:hover, #closeColor:hover, #closeNotifConfig:hover, #closeNote:hover {
  background-color: #e53935 !important; /* Assombrit le rouge au survol */
}
#saveKeyConfig, #closeKeyConfig, #syncFavConfig, #saveFavConfig, #closeFavConfig, #saveColor, #closeColor, #saveNotifConfig, #closeNotifConfig, #saveNote, #closeNote {
  margin-top: 10px; /* Ajoute un espace de 10px au-dessus du second bouton */
  width: 100%; /* Utilise width: 100% pour assurer que le bouton prend toute la largeur */
}
/*Pour un bouton seul sur une ligne
#configurerNotif {
  flex-basis: 100% !important; /* Prend la pleine largeur pour forcer à aller sur une nouvelle ligne */
  margin-right: 1% !important; /* Annuler la marge droite si elle est définie ailleurs */
  margin-left: 1% !important; /* Annuler la marge droite si elle est définie ailleurs */
}*/

/*Alignement des listes de thèmes*/
.flex-container {
  display: flex;
  gap: 20px;
}
.flex-item {
  flex: 1;
}
`;
        document.head.appendChild(styleMenu);
        // Assurez-vous que les boutons sont toujours accessibles
        function adjustPopupLayout() {
            const popup = document.getElementById('configPopup');
            if (popup) {
                const rect = popup.getBoundingClientRect();
                if (rect.bottom > window.innerHeight) {
                    popup.style.top = `${window.innerHeight - rect.height}px`;
                }
            }
        }

        window.addEventListener('resize', adjustPopupLayout); // Ajuster la position lors du redimensionnement de la fenêtre
        // Fonction pour rendre la fenêtre déplaçable
        function dragElement(elmnt) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(elmnt.id + "Header")) {
                // si présent, le header est l'endroit où vous pouvez déplacer la DIV:
                document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
            } else {
                // sinon, déplace la DIV de n'importe quel endroit à l'intérieur de la DIV:
                elmnt.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
                e = e || window.event;
                e.preventDefault();
                // position de la souris au démarrage:
                pos3 = e.clientX;
                pos4 = e.clientY;
                document.onmouseup = closeDragElement;
                // appelle la fonction chaque fois que le curseur bouge:
                document.onmousemove = elementDrag;
            }

            function elementDrag(e) {
                e = e || window.event;
                e.preventDefault();
                // calcule la nouvelle position de la souris:
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // définit la nouvelle position de l'élément:
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            }

            function closeDragElement() {
                // arrête le mouvement quand le bouton de la souris est relâché:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }

        // Fonction pour calculer la taille de localStorage en Mo
        function calculerTailleLocalStorageEnMo() {
            let tailleTotale = 0;

            // Parcours de toutes les clés du localStorage
            for (let i = 0; i < localStorage.length; i++) {
                let key = localStorage.key(i);
                let valeur = localStorage.getItem(key);

                // Ajoute la taille de la clé et de la valeur (en octets)
                tailleTotale += key.length + valeur.length;
            }

            // Convertit la taille totale en Mo (1 Mo = 1024 * 1024 octets)
            return (tailleTotale / (1024 * 1024)).toFixed(2); // Limité à 2 décimales
        }

        // Fonction pour obtenir l'affichage de la mémoire avec couleur
        function afficherMemoireLocalStorage() {
            const tailleMaximale = 5; // 5 Mo de capacité maximale pour la plupart des navigateurs
            const tailleActuelle = parseFloat(calculerTailleLocalStorageEnMo());
            let utilisation = (tailleActuelle / tailleMaximale) * 100;

            // Limite le pourcentage à 100%
            if (utilisation > 100) {
                utilisation = 100;
            }

            let couleur;
            // Moins de 50% utilisé, affichage en vert
            if (utilisation < 50) {
                couleur = '#008000';
                // Entre 50% et 90%, affichage en bleu
            } else if (utilisation >= 50 && utilisation <= 90) {
                couleur = '#007FFF';
                // Plus de 90%, affichage en rouge
            } else {
                couleur = '#FF0000';
            }

            // Chaîne avec la taille utilisée et la taille maximale
            let affichage = `(utilisation : <span style="color:${couleur};">${tailleActuelle} Mo (${utilisation.toFixed(2)}%)</span>)`;

            // Retourner le texte centré
            //return `<div style="text-align: center;">${affichage}</div>`;
            return affichage;
        }

        // Crée la fenêtre popup de configuration avec la fonction de déplacement
        async function createConfigPopup() {
            if (document.getElementById('configPopup')) {
                return; // Termine la fonction pour éviter de créer une nouvelle popup
            }
            let isPremiumPlus = false;
            let isPremium = false;
            let isPlus = false;
            let dateLastSave = false;
            const responsePremiumPlus = await verifyTokenPremiumPlus(API_TOKEN);
            const responsePremium = await verifyTokenPremium(API_TOKEN);
            const responsePlus = await verifyTokenPlus(API_TOKEN);
            let apiToken = "";
            if (API_TOKEN == undefined) {
                apiToken = "";
            } else {
                isPremiumPlus = responsePremiumPlus && responsePremiumPlus.status === 200;
                isPremium = responsePremium && responsePremium.status === 200;
                isPlus = responsePlus && responsePlus.status === 200;
                apiToken = API_TOKEN;
                if (isPremium) {
                    dateLastSave = await lastSave();
                }
            }
            //Style pour les deux listes déroulantes l'une a coté de l'autre
            const style = document.createElement('style');
            style.innerHTML = `
  .flex-container-theme {
    display: flex;
    gap: 10px;
  }
  .flex-item-theme {
    flex: 1;
  }
  .button-container.action-buttons button[disabled] {
    cursor: not-allowed !important;  /* Curseur spécifique pour indiquer que le bouton est désactivé */
  }

  .button-container.action-buttons button[disabled]:hover {
    cursor: not-allowed !important;  /* Le curseur reste le même */
  }
`;
            document.head.appendChild(style);


            const popup = document.createElement('div');
            popup.id = "configPopup";
            popup.innerHTML = `
    <h2 id="configPopupHeader">Paramètres PickMe v${version}<span id="closePopup" style="float: right; cursor: pointer;">&times;</span></h2>
    <div style="text-align: center; margin-bottom: 20px;">
        <p id="links-container" style="text-align: center;">
            <a href="https://pickme.alwaysdata.net/wiki/doku.php?id=plugins:pickme" target="_blank">
                <img src="https://pickme.alwaysdata.net/img/wiki.png" alt="Wiki PickMe" style="vertical-align: middle; margin-right: 5px; width: 25px; height: 25px;">
                Wiki PickMe
            </a>
            ${mobileEnabled ? '<br>' : '<span id="separator"> | </span>'}
            <a href="https://pickme.alwaysdata.net/wiki/doku.php?id=vine:comment_nous_aider_gratuitement" target="_blank">
                <img src="https://pickme.alwaysdata.net/img/soutiens.png" alt="Soutenir gratuitement" style="vertical-align: middle; margin-right: 5px; width: 25px; height: 25px;">
                Soutenir gratuitement
            </a>
        </p>
    </div>
    <div class="checkbox-container">
      ${createCheckbox('highlightEnabled', 'Surbrillance des nouveaux produits', 'Permet d\'ajouter un fond de couleur dès qu\'un nouveau produit est trouvé sur la page en cours. La couleur peut se choisir avec le bouton plus bas dans ces options.')}
      ${createCheckbox('firsthlEnabled', 'Mettre les nouveaux produits en début de page', 'Les nouveaux produits seront mis au tout début de la liste des produits sur la page en cours')}
      ${createCheckbox('paginationEnabled', 'Affichage des pages en partie haute', 'En plus des pages de navigation en partie basse, ajoute également la navigation des pages en début de liste des produits')}
      ${createCheckbox('hideEnabled', 'Pouvoir cacher des produits et ajouter des favoris', 'Ajoute l\'option qui permet de cacher certains produits de votre choix ainsi que des favoris (le produit devient impossible à cacher et sera toujours mis en tête en liste sur la page), ainsi que les boutons pour tout cacher ou tout afficher en une seule fois')}
      ${createCheckbox('catEnabled', 'Différence de quantité dans les catégories', 'Afficher à côté de chaque catégorie du bandeau à gauche la différence de quantité positive ou négative par rapport à la dernière fois où vous avez vu un nouveau produit. Se réinitialise à chaque fois que vous voyez un nouveau produit ou quand vous appuyez sur le bouton "Reset"')}
      ${createCheckbox('taxValue', 'Remonter l\'affichage de la valeur fiscale estimée (et des variantes sur mobile)', 'Dans la fênetre du produit qui s\'affiche quand on clique sur "Voir les détails", remonte dans le titre la valeur fiscale du produit au lieu qu\'elle soit en fin de fenêtre. Remonte également la sélection des variantes avec l\'affichage mobile')}
      ${createCheckbox('cssEnabled', 'Utiliser l\'affichage réduit', 'Affichage réduit, pour voir plus de produits en même temps, avec également réduction de la taille des catégories. Option utile sur mobile par exemple. Non compatible avec l\'affichage du nom complet des produits et l\'affichage mobile')}
      ${createCheckbox('mobileEnabled', 'Utiliser l\'affichage mobile', 'Optimise l\affichage sur mobile, pour éviter de mettre la "Version PC". Il est conseillé de cacher également l\'entête avec cette option. Non compatible avec l\'affichage du nom complet des produits et l\'affichage réduit')}
      ${createCheckbox('headerEnabled', 'Cacher totalement l\'entête de la page', 'Cache le haut de la page Amazon, celle avec la zone de recherche et les menus')}
      ${createCheckbox('extendedEnabled', 'Afficher le nom complet des produits', 'Affiche 4 lignes, si elles existent, au nom des produits au lieu de 2 en temps normal. Non compatible avec l\'affichage alternatif')}
      ${createCheckbox('isParentEnabled', 'Distinguer les produits ayant des variantes', 'Ajoute l\'icone 🛍️ dans le texte du bouton des détails si le produit possède des variantes (couleurs, conditionnements, tailles, etc...). Attention, parfois il n\'y aura qu\'une variante, mais le menu déroulant sera probablement présent')}
      ${createCheckbox('wheelfixEnabled', 'Corriger le chargement infini des produits', 'Corrige le bug quand un produit ne charge pas (la petite roue qui tourne sans fin). Attention, même si le risque est très faible, on modifie une information transmise à Amazon, ce qui n\'est pas avec un risque de 0%')}
      ${createCheckbox('fullloadEnabled', 'N\'afficher la page qu\'après son chargement complet', 'Attend le chargement complet des modifications de PickMe avant d\'afficher la page. Cela peut donner la sensation d\'un chargement plus lent de la page mais évite de voir les produits cachés de façon succincte ou le logo Amazon par exemple')}
      ${createCheckbox('autohideEnabled', 'Utiliser le filtre par mots-clés', 'Permet de cacher automatiquement des produits selon des mots clés, ou au contraire d\'en mettre en avant. La configuration se fait via le bouton "Configurer les mots-clés pour le filtre". Peut ajouter de la latence au chargement de la page, surtout si l\'option "N\'afficher la page qu\'après son chargement complet" est activée')}
      ${createCheckbox('ordersEnabled', 'Afficher code erreur/Envoyer mes commandes', 'Afficher un code erreur quand une commande ne passe pas. Attention, cela envoi également vos commandes sur le serveur pour le besoin de certaines fonctions (comme pouvoir voir le prix par mois/année de vos commandes sur le discord)')}
      ${createCheckbox('callUrlEnabled', '(Webhook) Appeler une URL lors de la découverte d\'un nouveau produit en recommandation', 'Appelle l\'URL choisie (bouton plus bas) lors de la découverte d\'un nouveau produit en reco. Cela peut être une API ou un MP3 (le fichier doit être donné sous la forme d\'un lien internet). Si c\'est un MP3, il sera également utilisé pour le son des notifications')}
      ${isPlus ? createCheckbox('fastCmd', '(Admin) Ajouter un bouton de "Commande rapide"', 'Ajoute un bouton sur tous les produits pour commander en un clic. Si le produit à des variantes, la première variante sera choisi. L\'adresse de livraison sera celle du menu déroulant plus bas. \n\nLégende :\n\n- 🚀 : pas de variante\n- 🛍️ : avec variantes') : ''}
      ${isPlus ? createCheckbox('ordersPercent', '(Admin) Afficher le % de commandes', '') : ''}
      ${createCheckbox('fastCmdEnabled', '(PC) Accélérer le processus de commandes', 'Met le focus sur le bouton pour commander (il suffira donc de faire "Entrée" pour valider) et agrandir la fenêtre contenant les adresses, ce qui alignera les boutons de validation des deux fenêtres si vous souhaitez cliquer')}
      ${createCheckbox('recoHReload', '(PC) Recharger la page reco à heure fixe', 'Recharge la page (uniquement celle des recos, celle-ci doit être ouverte pour que ça fonctionne) quand on est une heure fixe (00 minutes, auquel on prend 3 à 8 secondes en plus par sécurité) pour vérifier la reco horaire. Il est conseillé de coupler avec le webhook pour être prévenu. Incompatible sur mobile')}
      ${createCheckbox('notifEnabled', '(Premium) Activer les notifications', 'Affiche une notification lors du signalement d\'un nouvel objet "Disponible pour tous", un up ou autre selon la configuration. Ne fonctionne que si une page Amazon était active dans les dernières secondes ou si le centre de notifications est ouvert en Auto-refresh de moins de 30 secondes',!isPremium)}
      ${createCheckbox('ordersInfos', '(Premium) Afficher l\'ETV et les informations de la communauté sur les commandes','Affiche l\'ETV du produit, le nombre de variantes et s\'il est limité (si info disponible) ainsi que le nombre de personnes ayant pu commander ou non le produit (rond vert : commande réussie, rond rouge : commande en erreur)', !isPremium)}
      ${createCheckbox('statsEnabled', '(Premium+) Afficher les statistiques produits','Affiche la quantité de produits ajoutés ce jour et dans le mois à côté des catégories', !isPremiumPlus)}
      ${createCheckbox('ordersStatsEnabled', '(Premium+) Afficher le nombre de commandes du jour/mois','Affiche le nombre de commandes passées sur la journée et le mois en cours', !isPremiumPlus)}
    </div>
     <div class="api-token-container">
      <label for="apiTokenInput">Clé API :</label>
      <input type="text" id="apiTokenInput" value="${apiToken}" style="width: 100%; max-width: 480px; margin-bottom: 10px;" />
      <div class="flex-container-theme">
    <div class="theme-container flex-item-theme">
      <label for="themeSelect">Thème :</label>
      <select id="themeSelect" style="width: 100%; max-width: 480px; margin-bottom: 10px; height: 31px;">
        <option value="default">Clair (défaut)</option>
        <option value="dark">Sombre</option>
      </select>
    </div>
    <div class="button-color-container flex-item-theme">
      <label for="buttonColorSelect">Boutons :</label>
      <select id="buttonColorSelect" style="width: 100%; max-width: 480px; margin-bottom: 10px; height: 31px;">
        <option value="default">Défaut</option>
        <option value="black">Noir</option>
        <option value="blue">Bleu</option>
        <option value="pink">Rose</option>
        <option value="purple">Violet</option>
        <option value="red">Rouge</option>
        <option value="green">Vert</option>
        <option value="orange">Orange</option>
      </select>
    </div>
    </div>
${isPlus ? `
  <div class="address-selector-container flex-item-theme" style="width: 100%;">
    <label for="address-selector">Adresse pour la commande rapide :</label>
    <select id="address-selector" style="width: 100%; margin-bottom: 10px; height: 31px;">
    </select>
  </div>
` : ''}
    ${addActionButtons(!isPremium, !isPremiumPlus, dateLastSave)}
  `;
            document.body.appendChild(popup);

            //Créer la liste déroulante des adresses
            if (isPlus) {
                createAddress();
                document.getElementById('fastCmd').addEventListener('change', function() {
                    if (this.checked) {
                        varFastCmd();
                    } else {
                        GM_deleteValue('fastCmdVar');
                    }
                });
            } else {
                GM_setValue('fastCmd', false);
                GM_setValue('ordersPercent', false);
                GM_deleteValue('fastCmdVar');
            }

            //Initialiser le thème et choisir celui qui est actif dans la liste
            document.getElementById('themeSelect').value = savedTheme;

            //Initialiser la couleur des boutons et choisir celle qui est active dans la liste
            document.getElementById('buttonColorSelect').value = savedButtonColor;

            document.getElementById('cssEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('mobileEnabled').checked = false;
                }
            });

            if (document.getElementById('cssEnabled').checked || document.getElementById('fastCmdEnabled').checked || document.getElementById('recoHReload').checked) {
                document.getElementById('mobileEnabled').checked = false;
            }

            document.getElementById('mobileEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('cssEnabled').checked = false;
                    document.getElementById('fastCmdEnabled').checked = false;
                    document.getElementById('recoHReload').checked = false;
                }
            });

            document.getElementById('fastCmdEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('mobileEnabled').checked = false;
                }
            });

            document.getElementById('recoHReload').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('mobileEnabled').checked = false;
                }
            });

            document.getElementById('callUrlEnabled').addEventListener('change', function() {
                if (this.checked) {
                    if (!isValidUrl(callUrl)) {
                        alert("Merci de saisir une URL valide avant d'activer l'option");
                        document.getElementById('callUrlEnabled').checked = false;
                    }
                }
            });

            document.getElementById('hideEnabled').addEventListener('change', function() {
                if (this.checked) {
                    hideBas = window.confirm("Ajouter des boutons en bas de page pour rendre visibles ou cacher (en plus de ceux en haut de page) ?");
                    GM_setValue('hideBas', hideBas);
                }
            });

            document.getElementById('ordersInfos').addEventListener('change', function() {
                if (this.checked) {
                    statsInReviews = window.confirm("Afficher également les informations de la communauté sur les commandes dans les avis ?");
                    GM_setValue('statsInReviews', statsInReviews);
                }
            });

            document.getElementById('notifEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('configurerNotif').disabled = false;
                    // Demander à l'utilisateur s'il est sur mobile ou PC
                    onMobile = window.confirm("Êtes-vous sur un appareil mobile ?");

                    // Utilisation de GM pour set la variable
                    GM_setValue('onMobile', onMobile);

                    // Demander à l'utilisateur s'il est sur mobile ou PC
                    shortcutNotif = window.confirm("Souhaitez-vous ajouter un raccourci vers le centre de notifications  ?");

                    // Utilisation de GM pour set la variable
                    GM_setValue('shortcutNotif', shortcutNotif);
                } else {
                    document.getElementById('configurerNotif').disabled = true;
                }
            });

            document.getElementById('ordersStatsEnabled').addEventListener('change', function() {
                var ordersEnabledCheckbox = document.getElementById('ordersEnabled');
                if (this.checked) {
                    ordersEnabledCheckbox.checked = true;
                    ordersEnabledCheckbox.disabled = true;
                } else {
                    ordersEnabledCheckbox.disabled = false;
                }
            });

            document.getElementById('autohideEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('configurerFiltres').disabled = false;
                } else {
                    document.getElementById('configurerFiltres').disabled = true;
                }
            });

            function handleOrdersCheckboxes() {
                var ordersEnabledCheckbox = document.getElementById('ordersEnabled');
                var ordersStatsEnabledCheckbox = document.getElementById('ordersStatsEnabled');
                var ordersInfosCheckbox = document.getElementById('ordersInfos');

                if (ordersStatsEnabledCheckbox.checked || ordersInfosCheckbox.checked) {
                    ordersEnabledCheckbox.checked = true;
                    ordersEnabledCheckbox.disabled = true;
                } else {
                    ordersEnabledCheckbox.disabled = false;
                }
            }

            document.getElementById('ordersStatsEnabled').addEventListener('change', handleOrdersCheckboxes);
            document.getElementById('ordersInfos').addEventListener('change', handleOrdersCheckboxes);

            // Initialiser l'état des cases à cocher au chargement de la page
            handleOrdersCheckboxes();

            document.getElementById('closePopup').addEventListener('click', () => {
                document.getElementById('configPopup').remove();
            });

            // Ajoute des écouteurs pour les nouveaux boutons
            document.getElementById('configurerNotif').addEventListener('click', configurerNotif);
            document.getElementById('configurerTouches').addEventListener('click', function() {
                configurerTouches(isPremium);
            });
            document.getElementById('configurerFiltres').addEventListener('click', configurerFiltres);
            document.getElementById('setHighlightColor').addEventListener('click', setHighlightColor);
            document.getElementById('setHighlightColorFav').addEventListener('click', setHighlightColorFav);
            document.getElementById('syncProducts').addEventListener('click', syncProducts);
            document.getElementById('setUrl').addEventListener('click', setUrl);
            document.getElementById('testUrl').addEventListener('click', testUrl);
            document.getElementById('saveData').addEventListener('click', () => {
                if (confirm("Êtes-vous sûr de vouloir sauvegarder les paramètres ? Cela supprimera la sauvegarde actuelle (s'il y en a une)")) {
                    saveData();
                }
            });
            document.getElementById('restoreData').addEventListener('click', () => {
                //if (confirm("Êtes-vous sûr de vouloir restaurer la sauvegarde ?")) {
                restoreData();
                //}
            });
            document.getElementById('purgeStoredProducts').addEventListener('click', () => {
                if (confirm("Êtes-vous sûr de vouloir supprimer les produits enregistrés pour la surbrillance ?")) {
                    purgeStoredProducts(true);
                }
            });

            document.getElementById('purgeHiddenObjects').addEventListener('click', () => {
                purgeHiddenObjects(true);
            });

            document.getElementById('purgeAllItems').addEventListener('click', () => {
                purgeAllItems();
            });

            dragElement(popup);

            document.getElementById('saveConfig').addEventListener('click', saveConfig);
            document.getElementById('closeConfig').addEventListener('click', () => popup.remove());
        }

        function createCheckbox(name, label, explanation = null, disabled = false) {
            const isChecked = !disabled && GM_getValue(name, false) ? 'checked' : '';
            const isDisabled = disabled ? 'disabled' : '';
            // Choisis la couleur ici. Options: 'black', 'white', 'gray'
            const color = 'gray'; // Exemple: change cette valeur pour 'black', 'white', ou une autre couleur CSS valide

            // Génération de l'ID unique pour le span d'aide
            const helpSpanId = `help-span-${name}`;

            // Icône d'aide avec gestionnaire d'événements attaché via addEventListener
            const helpIcon = explanation ? `<span id="${helpSpanId}" style="text-decoration: none; cursor: help; margin-left: 4px; color: ${color}; font-size: 16px;">?</span>` : '';
            const checkboxHtml = `<label class="${isDisabled ? 'disabled' : ''}">
              <input type="checkbox" id="${name}" name="${name}" ${isChecked} ${isDisabled}>
              ${label} ${helpIcon}
          </label>`;

            // Attacher le gestionnaire d'événements après le rendu de l'HTML
            setTimeout(() => {
                const helpSpan = document.getElementById(helpSpanId);
                if (helpSpan) {
                    helpSpan.addEventListener('click', (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        alert(explanation); // Ou toute autre logique d'affichage d'explication
                    });
                }
            }, 0);

            return checkboxHtml;
        }

        //Création de la liste des adresses
        function createAddress() {
            // Sélectionnez tous les éléments contenant les adresses
            const addressOptions = document.querySelectorAll('.vvp-address-option');

            // Sélectionnez la liste déroulante dans laquelle vous voulez insérer les adresses
            const addressSelector = document.getElementById('address-selector');

            // Récupérer l'adresse sauvegardée dans GM
            const savedAddress = GM_getValue('savedAddress', null);

            // Vérifiez que l'élément addressSelector existe
            if (addressSelector) {
                // Pour chaque option d'adresse trouvée
                addressOptions.forEach(option => {
                    // Récupérez l'adresse
                    const addressLabel = option.querySelector('.a-label').innerText.trim();
                    const addressValue = option.querySelector('input[type="radio"]').value;
                    const addressId = option.getAttribute('data-address-id');
                    const legacyAddressId = option.getAttribute('data-legacy-address-id');

                    // Créez une nouvelle option pour la liste déroulante
                    const newOption = document.createElement('option');
                    newOption.value = addressValue;
                    newOption.textContent = addressLabel;

                    // Ajoutez les data-attributes pour pouvoir les récupérer plus tard
                    newOption.setAttribute('data-address-id', addressId);
                    newOption.setAttribute('data-legacy-address-id', legacyAddressId);

                    // Si l'adresse actuelle est celle qui est sauvegardée, la sélectionner
                    if (savedAddress && addressId === savedAddress.addressId) {
                        newOption.selected = true;
                    }

                    // Ajoutez la nouvelle option à la liste déroulante
                    addressSelector.appendChild(newOption);
                });

                // Ajout d'un événement pour sauvegarder l'adresse sélectionnée a chaque changement au lieu du bouton sauvegarder
                //addressSelector.addEventListener('change', saveAddress);

            } else {
                console.error('L\'élément address-selector est introuvable.');
            }
        }

        // Fonction pour sauvegarder l'adresse
        function saveAddress() {
            const addressSelector = document.getElementById('address-selector');
            if (addressSelector) {
                const selectedOption = addressSelector.options[addressSelector.selectedIndex];

                const selectedAddress = {
                    label: selectedOption.textContent,
                    value: selectedOption.value,
                    addressId: selectedOption.getAttribute('data-address-id'),
                    legacyAddressId: selectedOption.getAttribute('data-legacy-address-id')
                };

                // Sauvegarde de l'adresse sélectionnée dans GM
                GM_setValue('savedAddress', selectedAddress);
            }
        }

        // Sauvegarde la configuration
        async function saveConfig() {
            document.querySelectorAll('#configPopup input[type="checkbox"]').forEach(input => {
                GM_setValue(input.name, input.checked);
            });
            const newApiToken = document.getElementById('apiTokenInput').value;
            var response = await verifyToken(newApiToken);
            if (response && response.status === 200) {
                // Save token after validation
                GM_setValue('apiToken', newApiToken);
            } else if (response && response.status === 404) {
                GM_deleteValue("apiToken");
                alert("Clé API invalide !");
                return
            }
            // Enregistrer le thème sélectionné
            const selectedTheme = document.getElementById('themeSelect').value;
            GM_setValue('selectedTheme', selectedTheme);

            // Enregistrer la couleur des boutons sélectionnée
            const selectedButtonColor = document.getElementById('buttonColorSelect').value;
            GM_setValue('selectedButtonColor', selectedButtonColor);

            //Sauvegarde de l'adresse
            saveAddress();

            //On recharge la page et on ferme le menu
            window.location.reload();
            document.getElementById('configPopup').remove();
        }

        // Ajoute les boutons pour les actions spécifiques qui ne sont pas juste des toggles on/off
        function addActionButtons(isPremium, isPremiumPlus, dateLastSave) {
            return `
<div class="button-container action-buttons">

  <button id="setHighlightColor">Couleur de surbrillance des repop/nouveaux produits</button>
  <button id="setHighlightColorFav">Couleur de surbrillance des produits filtrés</button>
  <button id="configurerFiltres">Configurer les mots-clés pour le filtre</button>
  <button id="configurerTouches">(PC) Configurer les raccourcis clavier</button>
  <button id="setUrl">(Webhook) Choisir l'URL</button>
  <button id="testUrl">(Webhook) Tester l'URL</button>
  <button id="syncProducts">Synchroniser les produits avec le serveur</button>
  <button id="configurerNotif" ${isPremium || !notifEnabled ? 'disabled' : ''}>(Premium) Configurer les notifications</button>
  <button id="saveData" ${isPremium ? 'disabled' : ''}>(Premium) Sauvegarder les paramètres/produits</button>
  <button id="restoreData" ${isPremium || dateLastSave === "Aucune sauvegarde" ? 'disabled' : ''}>(Premium) Restaurer les paramètres/produits${dateLastSave ? ' (' + dateLastSave + ')' : ''}</button>
  <button id="purgeStoredProducts">Supprimer les produits enregistrés pour la surbrillance</button>
  <button id="purgeHiddenObjects">Supprimer les produits cachés et/ou les favoris</button>
  <button style="flex-basis: 100%;" id="purgeAllItems">Purger la mémoire ${afficherMemoireLocalStorage()}</button>
</div>
<div class="button-container final-buttons">
  <button class="full-width" id="saveConfig">Enregistrer</button>
  <button class="full-width" id="closeConfig">Fermer</button>
</div>
    `;
        }

        // Ajouter la commande de menu "Paramètres"
        GM_registerMenuCommand("Paramètres", createConfigPopup, "p");

        // Fonction pour créer la fenêtre popup de configuration des touches
        function createKeyConfigPopup(isPremium) {
            // Vérifie si une popup existe déjà et la supprime si c'est le cas
            const existingPopup = document.getElementById('keyConfigPopup');
            if (existingPopup) {
                existingPopup.remove();
            }

            // Crée la fenêtre popup
            const popup = document.createElement('div');
            popup.id = "keyConfigPopup";
            popup.style.cssText = `
        z-index: 10001; /* Assure-toi que ce z-index est suffisamment élevé pour surpasser les autres éléments */
        width: 350px;
    `;
            popup.innerHTML = `
        <h2 id="configPopupHeader">Configuration des touches<span id="closeKeyPopup" style="float: right; cursor: pointer;">&times;</span></h2>
        ${createKeyInput('keyLeft', 'Navigation à gauche (flêche : ArrowLeft)')}
        ${createKeyInput('keyRight', 'Navigation à droite (flêche : ArrowRight)')}
        ${createKeyInput('keyUp', 'Onglet suivant (flêche : ArrowUp)')}
        ${createKeyInput('keyDown', 'Onglet précédent (flêche : ArrowDown)')}
        ${createKeyInput('keyHide', 'Tout cacher')}
        ${createKeyInput('keyShow', 'Tout montrer')}
        ${createKeyInput('keySync', 'Synchroniser les produits avec le serveur et tout cacher')}
<div class="button-container final-buttons">
  <button class="full-width" id="saveKeyConfig">Enregistrer</button>
  <button class="full-width" id="closeKeyConfig">Fermer</button>
</div>
    `;

            document.body.appendChild(popup);
            //dragElement(popup); // Utilise ta fonction existante pour rendre la popup déplaçable

            // Ajout des écouteurs d'événements pour les boutons
            document.getElementById('saveKeyConfig').addEventListener('click', saveKeyConfig);
            document.getElementById('closeKeyConfig').addEventListener('click', () => document.getElementById('keyConfigPopup').remove());
            document.getElementById('closeKeyPopup').addEventListener('click', () => {
                document.getElementById('keyConfigPopup').remove();
            });
        }

        // Crée les champs de saisie pour les touches
        function createKeyInput(id, label, disabled = false) {
            const value = GM_getValue(id, ''); // Récupère la valeur actuelle ou une chaîne vide par défaut
            const disabledAttribute = disabled ? 'disabled' : ''; // Détermine si l'attribut disabled doit être ajouté
            return `
        <div style="margin-top: 10px;">
            <label for="${id}" style="display: block;">${label}</label>
            <input type="text" id="${id}" name="${id}" value="${value}" style="width: 100%; box-sizing: border-box; padding: 8px; margin-top: 4px;" ${disabledAttribute}>
        </div>
    `;
        }

        // Fonction pour enregistrer la configuration des touches
        function saveKeyConfig() {
            const keys = ['keyLeft', 'keyRight', 'keyUp', 'keyDown', 'keyHide', 'keyShow', 'keySync'];
            keys.forEach(key => {
                const inputValue = document.getElementById(key).value;
                GM_setValue(key, inputValue);
            });
            document.getElementById('keyConfigPopup').remove();
        }

        // Fonction pour créer la fenêtre popup de configuration des notifications
        function createNotifConfigPopup() {
            // Vérifie si une popup existe déjà et la supprime si c'est le cas
            const existingPopup = document.getElementById('notifConfigPopup');
            if (existingPopup) {
                existingPopup.remove();
            }

            // Crée la fenêtre popup
            const popup = document.createElement('div');
            popup.id = "notifConfigPopup";
            popup.style.cssText = `
        z-index: 10001;
        width: 500px;
    `;
            popup.innerHTML = `
    <h2>Configurer les notifications<span id="closeNotifPopup" style="float: right; cursor: pointer;">&times;</span></h2>
    <div class="checkbox-container">
    <u class="full-width">Options :</u><br>
    ${createCheckbox('notifFav', 'Filtrer "Autres articles"', 'Utilise les filtres (soit celui des favoris, soit celui pour exclure) pour ne remonter que les notifications favoris ou sans mots exclus et uniquement si c\'est un produit "Autres articles" (aucun filtre sur "Disponibles pour tous"). La notification apparaitra tout de même dans le centre de notifications. Prend en compte le filtre, même si l\'option des filtres est désactivée')}
    ${createCheckbox('notifSound', 'Jouer un son', 'Permet de jouer un son à réception d\'une notification. Astuce : pour personnaliser le son, il est possible d\'utiliser l\'option expérimentale pour saisir l\'URL du mp3 (uniquement) de votre choix')}
    <select id="filterOptions" ${notifFav ? '' : 'disabled'} style="margin-bottom: 10px;">
       <option value="notifFavOnly" ${filterOption === 'notifFavOnly' ? 'selected' : ''}>Ne voir que les produits avec mots-clés</option>
       <option value="notifExcludeHidden" ${filterOption === 'notifExcludeHidden' ? 'selected' : ''}>Tout voir sauf mots exclus</option>
    </select>
    ${createCheckbox('onMobile', 'Version mobile')}
    ${createCheckbox('shortcutNotif', 'Raccourci vers le centre de notifications')}
    <u class="full-width">Type de notifications :</u><br>
    ${createCheckbox('notifUp', 'Up')}
    ${createCheckbox('notifRecos', 'Recos')}
    ${createCheckbox('notifPartageAFA', 'Disponibles pour tous')}
    ${createCheckbox('notifPartageAI', 'Autres articles')}
    ${createCheckbox('notifAutres', 'Divers (tests, informations, annonces, etc...)')}
    </div>
    <div class="button-container">
      <button id="saveNotifConfig">Enregistrer</button>
      <button id="closeNotifConfig">Fermer</button>
    </div>
    `;

            document.body.appendChild(popup);
            //dragElement(popup); // Utilise ta fonction existante pour rendre la popup déplaçable

            document.getElementById('notifFav').addEventListener('change', function() {
                document.getElementById('filterOptions').disabled = !this.checked;
            });

            // Ajout des écouteurs d'événements pour les boutons
            document.getElementById('closeNotifPopup').addEventListener('click', function() {
                popup.remove();
            });
            document.getElementById('saveNotifConfig').addEventListener('click', saveNotifConfig);
            document.getElementById('closeNotifConfig').addEventListener('click', function() {
                popup.remove();
            });
        }


        function saveNotifConfig() {
            document.querySelectorAll('#notifConfigPopup input[type="checkbox"]').forEach(input => {
                GM_setValue(input.name, input.checked);
                if (input.name == "notifFav") {
                    notifFav = input.checked;
                }
            });
            filterOption = document.getElementById('filterOptions').value;
            GM_setValue('filterOption', document.getElementById('filterOptions').value);
            document.getElementById('notifConfigPopup').remove(); // Ferme la popup après enregistrement
        }

        // Fonction pour créer la fenêtre popup de configuration des filtres
        async function createFavConfigPopup() {
            // Vérifie si une popup existe déjà et la supprime si c'est le cas
            const existingPopup = document.getElementById('favConfigPopup');
            if (existingPopup) {
                existingPopup.remove();
            }
            let isRole = false;
            const responseRole = await verifyTokenRole(API_TOKEN);
            isRole = responseRole && responseRole.status === 200;
            // Crée la fenêtre popup
            const popup = document.createElement('div');
            popup.id = "favConfigPopup";
            popup.style.cssText = `
        z-index: 10001;
        width: 600px;
    `;
            popup.innerHTML = `
        <h2 id="configPopupHeader">Configuration des mots-clés<span id="closeFavPopup" style="float: right; cursor: pointer;">&times;</span></h2>
        <div>
            <label for="favWords">Produits à mettre en avant :</label>
            <textarea id="favWords" name="favWords" style="width: 100%; height: 70px;">${GM_getValue('favWords', '')}</textarea>
        </div>
        <button class="full-width" id="syncFavConfig" ${isRole ? '' : 'disabled'}>(Synchroniser) Envoyer la liste vers discord</button>
        <div style="margin-top: 10px;">
            <label for="hideWords">Produits à cacher/exclure :</label>
            <textarea id="hideWords" name="hideWords" style="width: 100%; height: 110px">${GM_getValue('hideWords', '')}</textarea>
        </div><br>
<p style="font-size: 0.9em; color: #666;">Note&nbsp;: chaque recherche différente doit être séparée par une virgule. Les majuscules ne sont pas prises en compte. Exemple&nbsp;: coque iphone, chat, HUB.<br>Si un produit est à la fois favori et exclu, il ne sera pas exclu (caché).</p>
        <div class="button-container final-buttons">
          <button class="full-width" id="saveFavConfig">Enregistrer</button>
          <button class="full-width" id="closeFavConfig">Fermer</button>
        </div>
    `;

            document.body.appendChild(popup);
            //dragElement(popup); // Utilise ta fonction existante pour rendre la popup déplaçable

            // Ajout des écouteurs d'événements pour les boutons
            document.getElementById('syncFavConfig').addEventListener('click', syncFavConfig);
            document.getElementById('saveFavConfig').addEventListener('click', saveFavConfig);
            document.getElementById('closeFavConfig').addEventListener('click', () => document.getElementById('favConfigPopup').remove());
            document.getElementById('closeFavPopup').addEventListener('click', () => {
                document.getElementById('favConfigPopup').remove();
            });
        }


        function saveFavConfig() {
            const favWords = document.getElementById('favWords').value;
            const hideWords = document.getElementById('hideWords').value;
            GM_setValue('favWords', favWords);
            GM_setValue('hideWords', hideWords);
            document.getElementById('favConfigPopup').remove(); // Ferme la popup après enregistrement
        }

        function syncFavConfig() {
            if (confirm('Cela remplacera votre liste de mots-clés sur discord par celle de PickMe, êtes-vous sûr ?')) {
                const favWords = document.getElementById('favWords').value;
                const formData = new URLSearchParams({
                    version: version,
                    token: API_TOKEN,
                    keywords: favWords,
                });

                return fetch("https://pickme.alwaysdata.net/shyrka/synckeywords", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData.toString()
                })
                    .then(response => {
                    if (response.status === 200) {
                        //On récupère le texte de la réponse
                        return response.text().then(text => {
                            const syncButton = document.getElementById('syncFavConfig');
                            const originalText = syncButton.textContent;
                            syncButton.innerHTML = text;
                            setTimeout(() => {
                                syncButton.textContent = originalText;
                            }, 2000);
                            return {status: response.status, responseText: text};
                        });
                    } else if (response.status === 201) {
                        const syncButton = document.getElementById('syncFavConfig');
                        syncButton.innerHTML = 'Non autorisé';
                        syncButton.disabled = true;
                        return "Non autorisé";
                    } else {
                        throw new Error("Erreur lors de la récupération de la dernière sauvegarde");
                    }
                })
                    .catch(error => {
                    throw new Error("Erreur lors de la récupération de la dernière sauvegarde : " + error);
                });
            }
        }

        // Modification de la fonction configurerTouches pour ouvrir la popup
        function configurerTouches(isPremium) {
            createKeyConfigPopup(isPremium);
        }
        function configurerFiltres() {
            createFavConfigPopup();
        }
        function configurerNotif() {
            createNotifConfigPopup();
        }
        //End

        //Supprime les produits la depuis plus de 90 jours
        function purgeOldItems() {
            const items = GM_getValue("config");
            const storedProducts = JSON.parse(GM_getValue("storedProducts", '{}'));
            const date = new Date().getTime();

            for (const obj in items) {
                ((date - items[obj].date) >= ITEM_EXPIRY) ? delete items[obj] : null;
            }
            GM_setValue("config", items);
            //if (fullloadEnabled && !autohideEnabled) {
            //displayContent();
            //setTimeout(displayContent, 200);
            //}
        }
        //purgeOldItems();

        function truncateString(originalString) {
            var arr = originalString.split('\n');
            var tooLong = true;
            var variantsRemoved = {};
            var variantQuantities = {};
            var truncatedString = '';
            var count = 0;

            function compareItemLengths(y) {
                for (let x=0; x<arr.length; x++) {
                    if (x !== y && variantQuantities[y] >= variantQuantities[x] ) {
                        return true;
                    }
                }
            }

            while (tooLong) {

                if (count > 30) {
                    tooLong = false;
                }

                for (let x=0; x<arr.length; x++) {
                    var split = arr[x].split(' ● ');
                    var fullArrayLength = arr.join('').length;
                    if (split.length > 1 && !variantQuantities[x]) {
                        variantQuantities[x] = split.length;
                    }

                    if (split.length > 1 && fullArrayLength > MAX_COMMENT_LENGTH && compareItemLengths(x)) {
                        variantQuantities[x] = split.length - 1;
                        variantsRemoved[x] = (variantsRemoved.hasOwnProperty(x)) ? variantsRemoved[x]+1 : 1;
                        split.pop();
                        arr[x] = split.join(' ● ');
                        arr[x] += `** ... +${variantsRemoved[x]} more**`;
                    } else if (fullArrayLength <= MAX_COMMENT_LENGTH) {
                        break;
                    }
                }

                if (!(arr.join('\n').length > MAX_COMMENT_LENGTH)) {
                    truncatedString = arr.join('\n');
                    tooLong = false;
                }
                count++;
            }

            return truncatedString.trim();
        }

        //Fast command
        function addFastCmd() {
            const savedAddress = GM_getValue('savedAddress', null);
            const dataFastCmd = GM_getValue('fastCmdVar', null);
            let addressId = null;
            let legacyAddressId = null;
            // Vérifier si un objet a été récupéré
            if (savedAddress && dataFastCmd) {
                // Stocker les valeurs de addressId et legacyAddressId dans les variables
                addressId = savedAddress.addressId;
                legacyAddressId = savedAddress.legacyAddressId;
            } else {
                return;
            }

            const csrfToken = document.querySelector("input[name='csrf-token']").value;

            function createCartPurchaseButton(item) {
                const isParent = item.querySelector('input').getAttribute('data-is-parent-asin') === 'true'

                const asin = item.querySelector('.vvp-details-btn .a-button-input').dataset.asin
                const recommendationId = item.getAttribute('data-recommendation-id')

                const cartButton = document.createElement('button')
                cartButton.type = 'button'
                cartButton.className = 'a-button a-button-primary'
                //cartButton.style.height = '30px'
                if (mobileEnabled || cssEnabled) {
                    cartButton.style.display = 'block'
                    cartButton.style.marginLeft = '8px';
                    cartButton.style.setProperty('margin-top', '3px', 'important');
                } else {
                    cartButton.style.setProperty('margin-top', '-10px', 'important');
                }
                //Bouton pour produit unique ou avec variantes
                const buttonText = (mobileEnabled || cssEnabled)
                ? (isParent ? '🚀' : '🚀')
                : (isParent ? '🚀 Commande rapide' : '🚀 Commande rapide');

                const paddingStyle = (mobileEnabled || cssEnabled) ? 'padding: 4px 8px;' : '';

                cartButton.innerHTML = `<span class="a-button-inner"><span class="a-button-text emoji" style="${paddingStyle}">${buttonText}</span></span>`;
                cartButton.onclick = () => cartPurchase(recommendationId, asin, isParent)
                item.querySelector('.vvp-item-tile-content').appendChild(cartButton)
            }

            function showOrderResult(result, error) {
                if (result != null) {
                    let orderId = result.orderId;
                    let targetDiv = document.getElementById("vvp-scheduled-delivery-required-msg");
                    let newDiv = document.createElement("div");

                    newDiv.id = "vvp-generic-order-success-msg";
                    newDiv.className = "a-box a-alert a-alert-success";
                    newDiv.setAttribute("aria-live", "polite");
                    newDiv.setAttribute("aria-atomic", "true");

                    newDiv.innerHTML = '<div class="a-box-inner a-alert-container">' +
                        '<h4 class="a-alert-heading">Réussite&nbsp;!</h4>' +
                        '<i class="a-icon a-icon-alert"></i>' +
                        '<div class="a-alert-content">Votre demande de produit a été soumise.</div><strong>(Commande rapide PickMe) Numéro de commande : ' + orderId +
                        '</strong></div>';

                    targetDiv.insertAdjacentElement('afterend', newDiv);
                } else {
                    let targetDiv = document.getElementById("vvp-scheduled-delivery-required-msg");
                    let newDiv = document.createElement("div");

                    newDiv.id = "vvp-generic-request-error-msg";
                    newDiv.className = "a-box a-alert a-alert-error";
                    newDiv.setAttribute("role", "alert");

                    newDiv.innerHTML = '<div class="a-box-inner a-alert-container">' +
                        '<h4 class="a-alert-heading">Erreur</h4>' +
                        '<i class="a-icon a-icon-alert"></i>' +
                        '<div class="a-alert-content">' +
                        'Un problème est survenu lors de la création de votre demande. Demandez un autre article.<br><strong>(Commande rapide PickMe) Code erreur : ' + error +
                        '</strong> (<a href="https://pickme.alwaysdata.net/wiki/doku.php?id=plugins:pickme:codes_erreur" target="_blank">wiki des codes d\'erreurs</a>)</div>' +
                        '</div>';

                    targetDiv.insertAdjacentElement('afterend', newDiv);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            async function cartPurchase(recommendationId, asin, isParent) {
                //Prendre la première variation d'un produit
                if (isParent) {
                    const encodedId = encodeURIComponent(recommendationId)
                    const url = `https://www.amazon.fr/vine/api/recommendations/${encodedId}`

                    try {
                        const response = await fetch(url)
                        const data = await response.json()
                        asin = data.result?.variations?.[0]?.asin
                    } catch (error) {
                        console.log('PickMe FastCmd error fetching variation ASIN', error)
                        return
                    }
                }

                //On check que tout a une valeur
                if (!recommendationId || !asin || !addressId || !legacyAddressId || !csrfToken || !dataFastCmd) {
                    console.log('PickMe FastCmd : Impossible, données manquantes')
                    return
                }

                const payload = JSON.stringify({
                    recommendationId: recommendationId,
                    recommendationType: "SEARCH",
                    itemAsin: asin,
                    addressId: addressId,
                    legacyAddressId: legacyAddressId
                })

                try {
                    const req = await fetch(dataFastCmd, {
                        method: 'POST',
                        body: payload,
                        headers: {
                            'anti-csrftoken-a2z': csrfToken,
                            'content-type': 'application/json'
                        }
                    })

                    const response = await req.json()

                    //Lignes de tests
                    //var response = '{"result":null,"error":"ITEM_NOT_IN_ENROLLMENT"}';
                    //var response = '{"result":{"orderId":"404-12345-6789","legacyOrderId":null,"recommendationType":null,"recommendationId":null,"itemAsin":null,"customerId":null,"addressId":null,"legacyAddressId":null,"slateToken":null},"error":null}'
                    //var responseObject = JSON.parse(response);
                    //console.log(responseObject);

                    var responseObject = JSON.parse(JSON.stringify(response));
                    var result = responseObject.result;
                    var error = responseObject.error;
                    showOrderResult(result, error);
                } catch (error) {
                    console.log('PickMe FastCmd failed : ', error)
                }
            }

            document.body.querySelectorAll('.vvp-item-tile').forEach(createCartPurchaseButton)
        }

        //Met a jour le bouton s'il y a des variantes du produit
        function changeButtonProduct(item) {
            const isParent = item.querySelector('input').getAttribute('data-is-parent-asin') === 'true'
            var button = item.querySelector('.a-button-text');
            var newText = "";
            if (isParent && isParentEnabled) {
                newText = "🛍️ ";
            }
            if (mobileEnabled || cssEnabled) {
                newText = newText + "Détails";
            } else {
                newText = newText + "Voir les détails";
            }
            button.textContent = newText;
        }

        //Met a jour le bouton s'il y a des variantes du produit, en fonction du retour de l'API avec l'info limited et le nb de variantes
        function changeButtonProductPlus(item, limited = 0, nb_variations = 0) {
            const isParent = item.querySelector('input').getAttribute('data-is-parent-asin') === 'true'
            var button = item.querySelector('.a-button-text');
            var newText = "";
            var showDetails = true;
            if (limited == '1') {
                newText = newText + "⌛ ";
                showDetails = false;
            }
            if (isParent && isParentEnabled && nb_variations > 1) {
                newText = newText + "🛍️ (" + nb_variations + ") ";
                showDetails = false;
            } else if (isParent && isParentEnabled && nb_variations == 0) {
                newText = newText + "🛍️ ";
                showDetails = false;
            }
            if (mobileEnabled || cssEnabled) {
                if (showDetails) {
                    newText = newText + "Détails";
                }
            } else {
                newText = newText + "Voir les détails";
            }
            button.textContent = newText;
        }

        function verifyToken(token) {
            return fetch(`https://pickme.alwaysdata.net/shyrka/user/${token}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            })
                .then(response => response.text().then(text => {
                return {status: response.status, statusText: response.statusText, responseText: text};
            }))
                .catch(error => {
                console.error(error);
                throw error;
            });
        }

        async function verifyTokenPremiumPlus(token) {
            try {
                const response = await fetch(`https://pickme.alwaysdata.net/shyrka/userpremiumplus/${token}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                });

                const text = await response.text();
                return { status: response.status, statusText: response.statusText, responseText: text };
            } catch (error) {
                console.error("Erreur dans verifyTokenPremiumPlus :", error);
                throw error;
            }
        }

        async function verifyTokenPremium(token) {
            try {
                const response = await fetch(`https://pickme.alwaysdata.net/shyrka/userpremium/${token}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                });

                const text = await response.text();
                return { status: response.status, statusText: response.statusText, responseText: text };
            } catch (error) {
                console.error("Erreur dans verifyTokenPremium :", error);
                throw error;
            }
        }

        async function verifyTokenPlus(token) {
            try {
                const response = await fetch(`https://pickme.alwaysdata.net/shyrka/userplus/${token}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                });

                const text = await response.text();
                return { status: response.status, statusText: response.statusText, responseText: text };
            } catch (error) {
                console.error("Erreur dans verifyTokenPlus :", error);
                throw error;
            }
        }

        async function verifyTokenRole(token) {
            try {
                const response = await fetch(`https://pickme.alwaysdata.net/shyrka/userrole/${token}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                });

                const text = await response.text();
                return { status: response.status, statusText: response.statusText, responseText: text };
            } catch (error) {
                console.error("Erreur dans verifyTokenRole :", error);
                throw error;
            }
        }

        //Info serveur pour les commandes rapides
        function varFastCmd() {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
            });

            return fetch("https://pickme.alwaysdata.net/shyrka/fastcmd", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
                .then(varData => {
                const data = varData.data;
                GM_setValue("fastCmdVar", data);
                return { status: 200, responseText: JSON.stringify(varData) };
            })
                .catch(error => {
                throw error;
            });
        }

        async function askForToken(reason) {
            return new Promise(async (resolve, reject) => {
                var userInput = prompt(`Votre clé API est ${reason}. Merci d'entrer une clé API valide:`);

                if (userInput !== null) {
                    try {
                        var response = await verifyToken(userInput);
                        if (response && response.status === 200) {
                            // Save token after validation
                            GM_setValue('apiToken', userInput);
                            resolve(userInput);
                        } else if (response && response.status === 404) {
                            GM_deleteValue("apiToken");
                            alert("Clé API invalide !");
                            reject("Invalid API token");
                        } else {
                            GM_deleteValue("apiToken");
                            alert("Vérification de la clé échoué. Merci d'essayer plus tard.");
                            reject("Authorization failed");
                        }
                    } catch (error) {
                        GM_deleteValue("apiToken");
                        console.error("Error verifying API token:", error);
                        reject(error);
                    }
                } else {
                    GM_deleteValue("apiToken");
                    reject("Error: User closed the prompt. A valid API token is required.");
                }
            });
        }

        //Pickme add
        async function verifierCleAPI() {
            const cleAPI = GM_getValue("apiToken");
            if (!cleAPI) {
                console.log("Aucune clé API n'est configurée.");
                return false;
            }
            try {
                const reponse = await verifyToken(cleAPI);
                if (reponse && reponse.status === 200) {
                    return true;
                } else {
                    console.log("La clé API est invalide.");
                    return false;
                }
            } catch (erreur) {
                console.error("Erreur lors de la vérification de la clé API:", erreur);
                return false;
            }
        }
        //End

        function returnVariations() {
            var variations = {};

            document.querySelectorAll(`#vvp-product-details-modal--variations-container .vvp-variation-dropdown`).forEach(function(elem) {

                const type = elem.querySelector('h5').innerText;
                const names = Array.from(elem.querySelectorAll('.a-dropdown-container select option')).map(function(option) {
                    return option.innerText.replace(/[*_~|`]/g, '\\$&');
                });
                variations[type] = names;
            });
            return variations;
        }

        function generateCombinations(variations) {
            const variationKeys = Object.keys(variations);
            const variationValues = variationKeys.map(key => variations[key]);

            //Vérifier s'il y a au moins une variation avec des options
            if (variationValues.length === 0) {
                return [];
            }

            //Fonction pour calculer le produit cartésien avec gestion des cas spéciaux
            function cartesianProduct(arrays) {
                if (!arrays || arrays.length === 0) {
                    return [];
                }
                if (arrays.length === 1) {
                    //Retourner un tableau de tableaux pour maintenir la cohérence
                    return arrays[0].map(item => [item]);
                }
                return arrays.reduce((acc, curr) => {
                    return acc.flatMap(accItem => {
                        return curr.map(currItem => {
                            return [].concat(accItem, currItem);
                        });
                    });
                });
            }

            const combinations = cartesianProduct(variationValues);

            //Transformer les combinaisons en objets avec les clés appropriées
            return combinations.map(combination => {
                const comboObject = {};
                combination.forEach((value, index) => {
                    comboObject[variationKeys[index]] = value;
                });
                return comboObject;
            });
        }

        function variationFormatting(variations) {
            var str = (Object.keys(variations).length > 1) ? ':arrow_down: Dropdowns' : ':arrow_down: Dropdown';
            for (const type in variations) {
                const t = (variations[type].length > 1) ? `\n**${type.replace(/(y$)/, 'ie')}s (${variations[type].length}):** ` : `\n**${type}:** `; // plural, if multiple
                str += t + variations[type].join(' ● ');
            }
            return str;
        }

        function noteFormatting(notes) {
            var str = (notes.length > 1) ? ':notepad_spiral: Notes' : ':notepad_spiral: Note';
            for (const item of notes) {
                (item != null) ? str += `\n* ${item}` : null;
            }
            return str;
        }

        function countVariations(obj) {
            for (const key in obj) {
                if (Array.isArray(obj[key]) && obj[key].length > 1) {
                    return false;
                }
            }
            return true;
        }

        //PickMe Add
        //Compte le nombre de variations d'un objet
        function nbVariations(obj) {
            let total = 1;
            for (const key in obj) {
                if (Array.isArray(obj[key]) && obj[key].length > 0) {
                    total *= obj[key].length;
                }
            }
            return total;
        }
        //PickMe End

        function writeComment(productData) {
            var hasNoSiblings = countVariations(productData.variations);
            var comment = [];
            (productData.seller) ? comment.push(`Vendeur: ${productData.seller}`) : null;
            (productData.isLimited) ? comment.push(":hourglass: Limited") : null;
            (productData.variations) ? comment.push(variationFormatting(productData.variations)) : null;

            var notes = [];
            (productData.differentImages && hasNoSiblings) ? notes.push("Parent product photo might not reflect available child variant.") : null;
            notes = notes.filter(value => value !== null);
            (notes.length > 0) ? comment.push(noteFormatting(notes)) : null;

            if (comment.length > MAX_COMMENT_LENGTH) {
                comment = truncateString(comment);
            }

            comment = comment.join('\n');
            comment = comment?.replace("\n", "\n\n");

            return comment;
        }

        //Quand on clic sur le bouton discord
        async function buttonHandler() {

            //Données pour transmissions
            var productData = {};
            var childAsin = document.querySelector("a#vvp-product-details-modal--product-title").href.match(/amazon..+\/dp\/([A-Z0-9]+).*$/)[1];
            var childImage = document.querySelector('#vvp-product-details-img-container > img');
            var variations = returnVariations();
            productData.variations = (Object.keys(variations).length > 0) ? variations : null;
            productData.isLimited = (document.querySelector('#vvp-product-details-modal--limited-quantity').style.display !== 'none') ? true : false;
            productData.asin = parentAsin;
            productData.enrollment = parentEnrollment;
            productData.differentChild = (parentAsin !== childAsin) ? true : false; //comparing the asin loaded in the modal to the one on the webpage
            productData.differentImages = (parentImage !== childImage.src?.match(PRODUCT_IMAGE_ID)[1]) ? true : false;
            productData.etv = document.querySelector("#vvp-product-details-modal--tax-value-string")?.innerText.replace("€", "");
            productData.queue = queueType;
            productData.seller = document.querySelector("#vvp-product-details-modal--by-line").innerText.replace(/^par /, '');
            //productData.comments = writeComment(productData);

            const response = await sendDataToAPI(productData);

            var listOfItems = GM_getValue('config');
            //Test pour supprimer un partage
            //const asintest = "B0D25RX87G";
            //listOfItems[asintest] = {};

            if (response) {
                if (response.status == 200) {
                    listOfItems[productData.asin] = {};
                    listOfItems[productData.asin].status = 'Posted';
                    listOfItems[productData.asin].queue = productData.queue;
                    listOfItems[productData.asin].date = new Date().getTime();
                    GM_setValue('config', listOfItems);
                    updateButtonIcon(2);
                    //PickMe add
                } else if (response.status == 201) {
                    listOfItems[productData.asin] = {};
                    listOfItems[productData.asin].status = 'Posted';
                    listOfItems[productData.asin].queue = productData.queue;
                    listOfItems[productData.asin].date = new Date().getTime();
                    GM_setValue('config', listOfItems);
                    updateButtonIcon(4);
                    //End
                } else if (response.status == 400 || response.status == 401) { // invalid token
                    updateButtonIcon(5);
                    // Will prompt the user to enter a valid token
                    askForToken("manquante/invalide").then((value) => {
                        API_TOKEN = value;
                        buttonHandler(); // retry the API request
                    }).catch((error) => {
                        console.error(error);
                    });
                } else if (response.status == 422) { // incorrect parameters (API might have been updated) or posting is paused
                    updateButtonIcon(6);
                } else if (response.status == 429) { // too many requests
                    updateButtonIcon(3);
                    //PickMe add
                } else if (response.status == 423) { // Ancien produit
                    listOfItems[productData.asin] = {};
                    listOfItems[productData.asin].status = 'Posted';
                    listOfItems[productData.asin].queue = productData.queue;
                    listOfItems[productData.asin].date = new Date().getTime();
                    GM_setValue('config', listOfItems);
                    updateButtonIcon(7);
                }
                //End
            }

        }

        let productDetailsModal;

        function updateButtonPosition() {
            const button = document.querySelector('.a-button-discord');
            const container = productDetailsModal;

            // check the size of the modal first before determining where the button goes
            /*if (container.offsetWidth < container.offsetHeight) {
                // the See Details modal is taller, so moving it toward the bottom
                button.classList.add('mobile-vertical');
                button.parentElement.appendChild(button);
            } else {
                // revert to the original button placement
                button.classList.remove('mobile-vertical');
                button.parentElement.prepend(button);
            }*/
            button.classList.remove('mobile-vertical');
            button.parentElement.prepend(button);
            button.removeElement;
            button.addEventListener("click", buttonHandler);
        }

        // Distinguishes the correct modal since Amazon doesn't distinguish them at all
        function getCorrectModal() {
            var btnHeaders = document.querySelectorAll('.vvp-modal-footer');
            var filteredHeaders = Array.from(btnHeaders).map(function (modal) {
                var productDetailsHeader = modal.parentElement.parentElement.querySelector('.a-popover-header > .a-popover-header-content');
                //PickMe edit
                if (productDetailsHeader && productDetailsHeader.innerText.trim() === "Détails de l'article") {
                    //End
                    return [modal, modal.parentElement.parentElement];
                }
                return null;
            });

            filteredHeaders = filteredHeaders.filter(function (item) {
                return item !== null;
            });

            return filteredHeaders[0];
        }

        // Initialize the button
        function addShareButton() {
            var discordBtn = `<button class="a-button-discord a-button" style="align-items: center;"></button>`;
            var modalElems = getCorrectModal(); // ensuring the button gets added to the correct modal
            modalElems[0].insertAdjacentHTML('afterbegin', discordBtn);
            productDetailsModal = modalElems[1];

            // Add observer to check if the modal gets resized
            const resizeObserver = new ResizeObserver(updateButtonPosition);
            resizeObserver.observe(productDetailsModal);

        }

        function updateButtonIcon(type) {
            var discordBtn = document.querySelector('.a-button-discord');
            discordBtn.disabled = false;
            discordBtn.classList.remove('a-button-disabled');

            if (type == 0) { // default
                discordBtn.innerHTML = `${btn_discordSvg}<span class="a-button-text">Partager sur discord</span>`;
                discordBtn.style.cursor = 'pointer';
            } else if (type == 1) { // submit button is clicked and waiting for API result
                discordBtn.innerHTML = `${btn_loadingAnim}<span class="a-button-text">Envoi en cours...</span>`;
                discordBtn.disabled = true;
                discordBtn.style.cursor = 'no-drop';
            } else if (type == 2) { // API: success
                discordBtn.innerHTML = `${btn_checkmark}<span class="a-button-text">OK</span>`;
                discordBtn.disabled = true;
                discordBtn.classList.add('a-button-disabled');
            } else if (type == 3) { // API: posting too quickly
                discordBtn.innerHTML = `${btn_warning}<span class="a-button-text">Partage trop rapide !</span>`;
                discordBtn.style.cursor = 'pointer';
            } else if (type == 4) { // Item was already posted to Discord
                discordBtn.innerHTML = `${btn_info}<span class="a-button-text">Déjà posté</span>`;
                discordBtn.disabled = true;
                discordBtn.classList.add('a-button-disabled');
                discordBtn.style.cursor = 'no-drop';
            } else if (type == 5) { // API: invalid token
                discordBtn.innerHTML = `${btn_error}<span class="a-button-text">Clé API invalide</span>`;
                discordBtn.disabled = true;
                discordBtn.classList.add('a-button-disabled');
                discordBtn.style.cursor = 'no-drop';
            } else if (type == 6) { // API: incorrect parameters
                discordBtn.innerHTML = `${btn_error}<span class="a-button-text">Erreur</span>`;
                discordBtn.style.cursor = 'pointer';
                //PickMe Edit
            } else if (type == 7) { // API: incorrect parameters
                discordBtn.innerHTML = `${btn_warning}<span class="a-button-text">Trop ancien</span>`;
                discordBtn.disabled = true;
                discordBtn.classList.add('a-button-disabled');
                discordBtn.style.cursor = 'no-drop';
            }
            //End

        }

        //PickMe edit
        function sendDataToAPI(data) {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
                page: valeurPage,
                tab: valeurQueue,
                asin: data.asin,
                enrollment: data.enrollment,
                seller: data.seller,
                isLimited: data.isLimited,
                variations: JSON.stringify(data.variations),
                etv: data.etv,
                nb_variations: nbVariations(data.variations),
            });
            //End
            updateButtonIcon(1);

            return fetch("https://pickme.alwaysdata.net/shyrka/newproduct", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                return response.text().then(text => {
                    console.log(response.status, text);
                    return {status: response.status, statusText: response.statusText, responseText: text};
                });
            })
                .catch(error => {
                console.error(error);
                updateButtonIcon(6);
                throw error;
            });
        }

        //PickMe add
        //Affichage de l'onglet "Favoris"
        function addFavTab() {
            if (window.location.href.startsWith('https://www.amazon.fr/vine/vine-items')) {
                mesFavoris();
            }
        }

        if (urlPattern.test(window.location.href)) {
            //Fix iPhone
            if (document.readyState !== 'loading') {
                addFavTab();
                addTab();
            }
            else {
                document.addEventListener('DOMContentLoaded', function () {
                    addFavTab();
                    addTab();
                });
            }
        }

        //Afficher l'onglet "Favoris"
        function mesFavoris() {
            const MAX_fS = 200; // Limite des favoris affichés

            if (apiKey && hideEnabled) {
                // Ajouter un nouvel onglet dans le menu
                const menu = document.querySelector('.a-tabs');
                const newTab = document.createElement('li');
                newTab.className = 'a-tab-heading';
                newTab.innerHTML = '<a href="javascript:void(0);" id="favorisTab" role="tab" aria-selected="false" tabindex="-1" style="color: #f8a103;">Favoris</a>';
                menu.appendChild(newTab);

                // Ajouter le conteneur pour afficher les favoris
                const container = document.createElement('div');
                container.id = 'favorisContainer';
                container.style.display = 'none';
                container.className = 'a-container vvp-body';
                container.innerHTML = `
            <div class="a-box a-tab-content" role="tabpanel" tabindex="0">
                <div class="a-box-inner">
                    <div class="a-section vvp-tab-content">
                        <div class="vvp-orders-table--heading-top" style="display: flex; justify-content: space-between; align-items: center;">
                            <h3 id="favorisCount">Favoris (0)</h3>
                            <span class="a-button a-button-primary vvp-orders-table--action-btn">
                                <span class="a-button-inner">
                                    <button id="supprimerTousFavoris" class="a-button-input" aria-labelledby="supprimer-tous"></button>
                                    <span class="a-button-text" aria-hidden="true" id="supprimer-tous">Tout supprimer</span>
                                </span>
                            </span>
                        </div>
                        <table class="a-normal vvp-orders-table">
                            <thead>
                                <tr class="vvp-orders-table--heading-row">
                                    <th id="vvp-orders-table--image-col-heading"></th>
                                    <th id="vvp-orders-table--product-title-heading" class="vvp-orders-table--text-col aok-nowrap" style="padding-bottom: 15px;">Produit</th>
                                    <th id="vvp-orders-table--order-date-heading" class="vvp-orders-table--text-col aok-nowrap" style="padding-bottom: 10px;">Vu pour la dernière fois</th>
                                    <th id="vvp-orders-table--actions-col-heading"></th>
                                </tr>
                            </thead>
                            <tbody id="favorisList"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
                document.querySelector('#a-page > div.a-container.vvp-body > div.a-tab-container.vvp-tab-set-container').appendChild(container);

                // Ajouter du style pour l'espace au-dessus de la première ligne de produit
                const style = document.createElement('style');
                style.textContent = `
            tr:first-child td, tr:first-child th {
                padding-top: 15px;
            }
            #favorisContainer {
                padding: 0;
            }
            .a-tab-content {
                border-radius: 0 0 8px 8px;
            }
        `;
                document.head.appendChild(style);

                // Fonction pour afficher les favoris
                async function afficherFavoris() {
                    const favorisList = document.getElementById('favorisList');
                    favorisList.innerHTML = ''; // Réinitialiser la liste des favoris

                    const favoris = [];
                    const listASINS = [];
                    const promises = Object.keys(localStorage).map(async (key) => {
                        if (key.endsWith('_f')) {
                            const favori = localStorage.getItem(key);
                            if (favori === '1') {
                                const asin = key.split('_f')[0]; // Extraire l'ASIN de la clé
                                listASINS.push("https://www.amazon.fr/dp/" + asin);
                                try {
                                    const productInfo = await infoProduct(asin); // Appel à la fonction infoProduct avec l'ASIN
                                    const lastSeenDate = productInfo.date_last_eu ? parseEuropeanDate(productInfo.date_last_eu) : null;
                                    const timeDiff = lastSeenDate ? new Date() - lastSeenDate : 0;
                                    favoris.push({ asin, key, productInfo, timeDiff });
                                } catch (error) {
                                    console.error("Erreur lors de la récupération des informations du produit:", error);
                                }
                            }
                        }
                    });

                    await Promise.all(promises);

                    // Trier les favoris : ceux avec timeDiff = 0 en premier, puis par timeDiff croissant
                    favoris.sort((a, b) => {
                        if (a.timeDiff === 0) return -1;
                        if (b.timeDiff === 0) return 1;
                        return a.timeDiff - b.timeDiff;
                    });

                    // Limiter les favoris à MAX_fS
                    const favorisAffiches = favoris.slice(0, MAX_fS);

                    // Mettre à jour le titre avec le nombre de favoris affichés
                    document.querySelector('#favorisCount').textContent = `Favoris (${favorisAffiches.length})`;

                    // Fonction pour convertir une date européenne en format de date interprétable
                    function parseEuropeanDate(dateStr) {
                        const [day, month, year, hours, minutes, seconds] = dateStr.split(/[/ :]/);
                        return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`);
                    }

                    // Afficher les favoris triés
                    favorisAffiches.forEach(({ asin, key, productInfo, timeDiff }) => {
                        const tr = document.createElement('tr');
                        tr.className = 'vvp-orders-table--row';
                        const urlProduct = "https://www.amazon.fr/dp/" + asin;
                        if (productInfo == "ASIN absent") {
                            tr.innerHTML = `
                        <td class="vvp-orders-table--image-col"><img alt="${asin}" src="https://pickme.alwaysdata.net/img/Pas-d-image-disponible-svg.png"></td>
                        <td class="vvp-orders-table--text-col"><a class="a-link-normal" target="_blank" rel="noopener" href="${urlProduct}">Recommandation ou produit inconnu : ${asin}</a></td>
                        <td class="vvp-orders-table--text-col"><strong>N/A</strong></td>
                        <td class="vvp-orders-table--actions-col"><span class="a-button a-button-primary vvp-orders-table--action-btn" style="margin-left: 10px; margin-right: 10px;"><span class="a-button-inner"><button data-key="${key}" class="a-button-input supprimerFavori" aria-labelledby="supprimer-${key}">Supprimer</button><span class="a-button-text" aria-hidden="true" id="supprimer-${key}">Supprimer</span></span></span></td>
                    `;
                        } else if (!productInfo.main_image && productInfo.title) {
                            tr.innerHTML = `
                        <td class="vvp-orders-table--image-col"><img alt="${asin}" src="https://pickme.alwaysdata.net/img/Pas-d-image-disponible-svg.png"></td>
                        <td class="vvp-orders-table--text-col"><a class="a-link-normal" target="_blank" rel="noopener" href="${urlProduct}">Produit indisponible : ${productInfo.title}</a></td>
                        <td class="vvp-orders-table--text-col"><strong>N/A</strong></td>
                        <td class="vvp-orders-table--actions-col"><span class="a-button a-button-primary vvp-orders-table--action-btn" style="margin-left: 10px; margin-right: 10px;"><span class="a-button-inner"><button data-key="${key}" class="a-button-input supprimerFavori" aria-labelledby="supprimer-${key}">Supprimer</button><span class="a-button-text" aria-hidden="true" id="supprimer-${key}">Supprimer</span></span></span></td>
                    `;
                        } else if (productInfo.title) {
                            // Vérifier la date et appliquer la couleur appropriée
                            let dateColor = '';

                            const hoursDiff = timeDiff / (1000 * 60 * 60);
                            const minutesDiff = timeDiff / (1000 * 60);

                            if (hoursDiff > 12) {
                                dateColor = 'color: #FF0000;';
                            } else if (minutesDiff < 1) {
                                dateColor = 'color: #007FFF;';
                            }
                            tr.innerHTML = `
                        <td class="vvp-orders-table--image-col"><img alt="${productInfo.title}" src="${productInfo.main_image}"></td>
                        <td class="vvp-orders-table--text-col"><a class="a-link-normal" target="_blank" rel="noopener" href="${urlProduct}">${productInfo.title}</a></td>
                        <td class="vvp-orders-table--text-col" style="${dateColor}"><strong>${productInfo.date_last_eu}</strong><br><a class="a-link-normal" target="_blank" rel="noopener" href="${productInfo.linkUrl}">${productInfo.linkText}</a></td>
                        <td class="vvp-orders-table--actions-col"><span class="a-button a-button-primary vvp-orders-table--action-btn" style="margin-left: 10px; margin-right: 10px;"><span class="a-button-inner"><button data-key="${key}" class="a-button-input supprimerFavori" aria-labelledby="supprimer-${key}">Supprimer</button><span class="a-button-text" aria-hidden="true" id="supprimer-${key}">Supprimer</span></span></span></td>
                    `;
                        }
                        favorisList.appendChild(tr);
                    });
                    ordersPostCmd(listASINS, "fav");
                    // Ajouter des écouteurs d'événement pour les boutons de suppression
                    document.querySelectorAll('.supprimerFavori').forEach(button => {
                        button.addEventListener('click', function() {
                            const key = this.getAttribute('data-key');
                            localStorage.removeItem(key);
                            const listItem = this.closest('tr');
                            if (listItem) {
                                listItem.remove(); //Supprimer la ligne correspondante
                            }
                            // Mettre à jour le titre avec le nombre de favoris affichés
                            const nbFavorisRestants = document.querySelectorAll('#favorisList .vvp-orders-table--row').length;
                            document.querySelector('#favorisCount').textContent = `Favoris (${nbFavorisRestants})`;
                        });
                    });
                }

                // Fonction pour supprimer tous les favoris
                function supprimerTousLesFavoris() {
                    if (confirm('Êtes-vous sûr de vouloir supprimer tous les favoris ?')) {
                        Object.keys(localStorage).forEach(key => {
                            if (key.endsWith('_f')) {
                                localStorage.removeItem(key);
                            }
                        });
                        afficherFavoris(); // Rafraîchir la liste des favoris
                    }
                }

                // Ajouter le gestionnaire d'événement pour le bouton "Supprimer tous les favoris"
                document.getElementById('supprimerTousFavoris').addEventListener('click', supprimerTousLesFavoris);

                // Afficher le conteneur des favoris lors du clic sur le nouvel onglet
                document.getElementById('favorisTab').addEventListener('click', function() {
                    document.querySelectorAll('.a-tab-heading').forEach(tab => {
                        tab.classList.remove('a-active');
                    });
                    this.parentElement.classList.add('a-tab-heading', 'a-active');
                    this.setAttribute('aria-selected', 'true');
                    document.querySelectorAll('.a-box-tab').forEach(box => {
                        box.style.display = 'none';
                    });
                    container.style.display = 'block';
                    afficherFavoris();
                });
            }
        }

        if (apiOk && window.location.href.startsWith("https://www.amazon.fr/vine/vine-items?queue=")) {
            // Appeler la fonction pour afficher les commandes
            if (ordersStatsEnabled || statsEnabled) {
                afficherInfos();
            }
        }

        function afficherInfos() {
            // Créer un tableau de promesses
            const promises = [];

            if (ordersStatsEnabled) {
                // Ajouter qtyOrders() directement au tableau des promesses
                const qtyOrdersPromise = qtyOrders();
                promises.push(qtyOrdersPromise);

                if (statsEnabled) {
                    // Lancer qtyProducts après le lancement de qtyOrders, sans attendre sa résolution
                    const qtyProductsPromise = qtyOrdersPromise.then(() => qtyProducts());
                    promises.push(qtyProductsPromise);
                }
            } else if (statsEnabled) {
                // Si ordersStatsEnabled est faux, lancer qtyProducts directement
                promises.push(qtyProducts());
            }

            // Attendre que toutes les promesses soient résolues
            Promise.all(promises).then(() => {
                // Afficher le conteneur une fois que toutes les données sont disponibles
                const infoContainer = document.getElementById('info-container');
                if (infoContainer) {
                    infoContainer.style.display = 'block';
                }
                //console.log("Toutes les informations ont été affichées.");
            }).catch((error) => {
                console.error("Erreur lors de l'affichage des informations:", error);
            });
        }

        function sendDatasToAPI(data) {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
                products: JSON.stringify(data),
                queue: valeurQueue,
                page: valeurPage,
            });

            return fetch("https://pickme.alwaysdata.net/shyrka/newproducts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => response.text().then(text => {
                return {status: response.status, statusText: response.statusText, responseText: text};
            }))
                .catch(error => {
                throw error;
            });
        }

        function extractASIN(input) {
            // Expression régulière pour identifier un ASIN dans une URL ou directement
            const regex = /\/dp\/([A-Z0-9]{10})|([A-Z0-9]{10})/;
            const match = input.match(regex);
            if (match) {
                return match[1] || match[2];
            }
            return null;
        }

        //Remonte les commandes sur le serveur, au cas ou on les a pas
        function saveOrders() {
            if (window.location.href.includes('orders')) {
                const listASINS = [];
                // Extraction des données de chaque ligne de produit
                document.querySelectorAll('.vvp-orders-table--row').forEach(row => {
                    let productUrl = row.querySelector('.vvp-orders-table--text-col a');
                    let asin;
                    if (productUrl) {
                        productUrl = productUrl.href;
                        asin = extractASIN(productUrl);
                    } else {
                        const asinElement = row.querySelector('.vvp-orders-table--text-col');
                        asin = asinElement ? asinElement.childNodes[0].nodeValue.trim() : null;
                    }
                    // On ajoute chaque asin à la liste pour appeler les infos de commandes
                    listASINS.push("https://www.amazon.fr/dp/" + asin);
                    const timestampElement = row.querySelector('[data-order-timestamp]');
                    const date = new Date(parseInt(timestampElement.getAttribute('data-order-timestamp')));
                    const year = date.getFullYear();
                    const month = ('0' + (date.getMonth() + 1)).slice(-2); // les mois sont indexés à partir de 0
                    const day = ('0' + date.getDate()).slice(-2);
                    const hours = ('0' + date.getHours()).slice(-2);
                    const minutes = ('0' + date.getMinutes()).slice(-2);
                    const seconds = ('0' + date.getSeconds()).slice(-2);
                    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                    const imageUrl = row.querySelector('.vvp-orders-table--image-col img').src;
                    let productName = row.querySelector('.vvp-orders-table--text-col a .a-truncate-full')
                    if (productName) {
                        productName = productName.textContent.trim();
                    } else {
                        productName = "Indispo";
                    }
                    const etv = row.querySelector('.vvp-orders-table--text-col.vvp-text-align-right').textContent.trim();
                    let formData = new URLSearchParams({
                        version: version,
                        token: API_TOKEN,
                        asin: asin,
                        date: formattedDate,
                        etv: etv,
                        imageUrl: imageUrl,
                        title: productName,
                    });
                    if (ordersEnabled) {
                        const buttonDetails = row.querySelector('.vvp-orders-table--action-btn');
                        // Crée le bouton Annuler dans un conteneur span pour imiter le style du bouton "Détails"
                        const buttonContainer = document.createElement('span');
                        buttonContainer.classList.add('a-button', 'a-button-base', 'vvp-orders-table--action-btn', 'canceled-button');
                        buttonContainer.style.marginTop = '5px';

                        const buttonInner = document.createElement('span');
                        buttonInner.classList.add('a-button-inner');

                        const cancelButton = document.createElement('button');
                        cancelButton.classList.add('a-button-text');
                        cancelButton.textContent = 'Annuler';
                        cancelButton.style.width = '100%';
                        cancelButton.style.height = '100%';
                        cancelButton.style.border = 'none';
                        cancelButton.style.background = 'none';
                        //buttonInner.style.background = '#28a745';
                        cancelButton.style.padding = '5px !important';
                        cancelButton.style.cursor = 'pointer';

                        buttonInner.appendChild(cancelButton);
                        buttonContainer.appendChild(buttonInner);

                        let formDataCancel = new URLSearchParams({
                            version: version,
                            token: API_TOKEN,
                            asin: asin,
                        });

                        fetch("https://pickme.alwaysdata.net/shyrka/infocancel", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: formDataCancel.toString()
                        })
                            .then(response => {
                            if (!response.ok) {
                                throw new Error("Erreur réseau : " + response.status);
                            }
                            return response.text();
                        })
                            .then(responseText => {
                            if (responseText === "true") {
                                cancelButton.textContent = 'Intégrer';
                                buttonDetails.style.background = '#dc3545';
                            } else {
                                cancelButton.textContent = 'Annuler';
                                buttonDetails.style.background = '#28a745';
                            }
                        })
                            .catch(error => {
                            console.error("Erreur lors de la requête :", error);
                        });

                        cancelButton.addEventListener('click', (event) => {
                            event.preventDefault();
                            const isCancelled = cancelButton.textContent.includes('Intégrer');
                            const newStatus = isCancelled ? 'uncancel' : 'cancel';
                            fetch("https://pickme.alwaysdata.net/shyrka/switchcancel", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                body: formDataCancel.toString()
                            })
                                .then(response => {
                                // On vérifie le statut de la réponse
                                if (!response.ok) {
                                    throw new Error(`Network response was not ok (status: ${response.status})`);
                                }
                                return response.text(); // ou response.json() si la réponse est au format JSON
                            })
                                .then(data => {
                                const greenCircle = row.querySelector('span:nth-of-type(1)');
                                let greenCount = parseInt(greenCircle.textContent);

                                if (isCancelled) {
                                    cancelButton.textContent = 'Annuler';
                                    buttonDetails.style.background = '#28a745';
                                    if (ordersInfos && Number.isInteger(greenCount)) {
                                        greenCircle.textContent = greenCount + 1;
                                    }
                                } else {
                                    cancelButton.textContent = 'Intégrer';
                                    buttonDetails.style.background = '#dc3545';
                                    if (ordersInfos && Number.isInteger(greenCount) && greenCount > 0) {
                                        greenCircle.textContent = greenCount - 1;
                                    }
                                }

                                // 'data' contient le contenu de la réponse (si besoin)
                                // console.log(data);
                            })
                                .catch(error => {
                                console.error(error);
                            });
                        });

                        // Ajoute le bouton Annuler sous le bouton Détails
                        const actionCol = row.querySelector('.vvp-orders-table--actions-col');
                        if (actionCol) {
                            actionCol.appendChild(buttonContainer);
                        }

                        fetch("https://pickme.alwaysdata.net/shyrka/orderlist", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: formData.toString()
                        })
                            .then(response => {
                            if (!response.ok) {
                                throw new Error("Erreur réseau " + response.status);
                            }
                            return response.text();
                        })
                            .then(data => {
                            console.log("Réponse du serveur :", data);
                        })
                            .catch(error => {
                            console.error("Erreur lors de la requête :", error);
                        });
                    }
                });

                if (ordersInfos && ordersEnabled) {
                    ordersPostCmd(listASINS, "orders");
                    if (ordersPercent) {
                        ordersPostPercent(listASINS);
                    }
                }
            }
        }

        //Affiche les "boules" sur les avis
        function reviewOrders() {
            if (window.location.href.includes('vine-reviews')) {
                const listASINS = [];
                //Extraction des données de chaque ligne de produit
                document.querySelectorAll('.vvp-reviews-table--row').forEach(row => {
                    let productUrl = row.querySelector('.vvp-reviews-table--text-col a');
                    let asin;
                    if (productUrl) {
                        productUrl = productUrl.href;
                        asin = extractASIN(productUrl);
                    } else {
                        const asinElement = row.querySelector('.vvp-reviews-table--text-col');
                        asin = asinElement ? asinElement.childNodes[0].nodeValue.trim() : null;
                    }
                    //On ajoute chaque asin à la liste pour appeler les infos de commandes
                    listASINS.push("https://www.amazon.fr/dp/" + asin);
                });
                if (ordersInfos && ordersEnabled) {
                    if (statsInReviews) {
                        ordersPostCmd(listASINS, "reviews");
                    }
                    if (ordersPercent) {
                        ordersPostPercent(listASINS);
                    }

                }
            }
        }

        if (ordersEnabled) {
            saveOrders();
            if (ordersInfos) {
                reviewOrders();
            }
        }

        function ordersPost(data) {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
                urls: JSON.stringify(data),
                queue: valeurQueue,
            });

            return fetch("https://pickme.alwaysdata.net/shyrka/asinsinfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
                .then(productsData => {
                showOrders(productsData);
                return productsData;
            })
                .catch(error => {
                // console.error(error);
                throw error;
            });
        }

        function ordersPostCmd(data, tab = "orders") {
            var apiURL = "https://pickme.alwaysdata.net/shyrka/asinsinfocmd";
            if (tab === "fav") {
                apiURL = "https://pickme.alwaysdata.net/shyrka/asinsinfofav";
            }

            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
                urls: JSON.stringify(data),
            });

            return fetch(apiURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
                .then(productsData => {
                showOrdersCmd(productsData, tab);
                return productsData;
            })
                .catch(error => {
                throw error; // vous pouvez logguer ou gérer l'erreur autrement si nécessaire
            });

        }

        function ordersPostPercent(data) {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
                urls: JSON.stringify(data),
            });

            return fetch("https://pickme.alwaysdata.net/shyrka/asinsinfocmdpercent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
                .then(productsData => {
                showOrdersPercent(productsData);
                return productsData;
            })
                .catch(error => {
                throw error;
            });
        }

        //Pour afficher les commandes, l'etv, si c'est limité et les variations
        function showOrders(data) {
            const items = document.querySelectorAll('.vvp-item-tile');
            if (items.length === 0) return;

            items.forEach(item => {
                //const imageElement = item.querySelector('img');
                const asin = item.getAttribute('data-asin') || item.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                const url = "https://www.amazon.fr/dp/" + asin;
                const orderData = data.find(d => d.url === url);
                if (!orderData) return;
                changeButtonProductPlus(item, orderData.limited, orderData.nb_variations);
                item.style.position = 'relative';

                const iconSources = {
                    success: "https://pickme.alwaysdata.net/img/orderok.png",
                    error: "https://pickme.alwaysdata.net/img/ordererror.png"
                };

                // Imaginons que extendedEnabled soit une variable booléenne :
                const positions = fastCmd && cssEnabled && !mobileEnabled
                ? 'bottom: 47%;'
                : fastCmd && !cssEnabled && !mobileEnabled
                ? 'bottom: 50.2%;'
                : (mobileEnabled && extendedEnabled)
                ? 'bottom: 58.5%;' // <-- Valeur spécifique quand mobileEnabled && extendedEnabled
                : mobileEnabled
                ? (fastCmd ? 'bottom: 54%;' : 'bottom: 43.5%;')
                : cssEnabled
                ? (fastCmd ? 'bottom: 45%;' : 'bottom: 37.5%;')
                : 'bottom: 45.4%;';


                const iconSize = mobileEnabled || cssEnabled ? '21px' : '28px';
                const fontSize = mobileEnabled || cssEnabled ? '12px' : '14px';
                const sidePadding = mobileEnabled || cssEnabled ? '3px' : '9px';

                ['success', 'error'].forEach(type => {
                    const icon = document.createElement('img');
                    icon.setAttribute('src', iconSources[type]);
                    icon.style.cssText = `position: absolute; ${positions} ${type === 'success' ? `left: ${sidePadding};` : `right: ${sidePadding};`} cursor: pointer; width: ${iconSize}; height: ${iconSize}; z-index: 10;`;

                    const count = document.createElement('span');
                    count.textContent = type === 'success' ? orderData.qty_orders_success : orderData.qty_orders_failed;
                    count.style.cssText = `position: absolute; ${positions} ${type === 'success' ? `left: ${sidePadding};` : `right: ${sidePadding};`} width: ${iconSize}; height: ${iconSize}; display: flex; align-items: center; justify-content: center; font-size: ${fontSize}; font-weight: bold; z-index: 20;`;

                    item.appendChild(icon);
                    item.appendChild(count);
                });

                if (orderData.etv_real !== null) {
                    const etvReal = document.createElement('div');
                    etvReal.textContent = orderData.etv_real + "€";
                    etvReal.style.cssText = `position: absolute; ${positions} left: 50%; transform: translateX(-50%); background-color: rgba(255, 255, 255, 0.7); color: ${orderData.etv_real === "0.00" ? 'red' : 'black'}; padding: 1px 2px; border-radius: 5px; font-size: 12px; white-space: nowrap; z-index: 20;`;

                    item.appendChild(etvReal);
                }
            });
        }

        //Pour afficher les commandes réussies ou non dans la liste des commandes
        async function showOrdersCmd(data, tab = "orders") {
            if (tab == "fav") {
                tab = "orders";
            }
            const items = document.querySelectorAll('.vvp-' + tab + '-table--row');
            if (items.length === 0) return;

            for (const item of items) {
                const imageElement = item.querySelector('.vvp-' + tab + '-table--image-col img');
                let productLink = item.querySelector('.vvp-' + tab + '-table--text-col a');
                let url;

                if (!productLink) {
                    const asinElement = item.querySelector('.vvp-' + tab + '-table--text-col');
                    let asin = asinElement ? asinElement.childNodes[0].nodeValue.trim() : null;
                    const productInfo = await infoProduct(asin);
                    if (productInfo && productInfo.title) {
                        asinElement.childNodes[0].nodeValue = "(" + asin + ") " + productInfo.title || asin;
                    }
                    url = "https://www.amazon.fr/dp/" + asin;
                } else {
                    url = productLink.href;
                }

                if (!imageElement || !url) continue;

                const orderData = data.find(d => d.url === url);
                if (!orderData) continue;

                const iconSources = {
                    success: "https://pickme.alwaysdata.net/img/orderok.png",
                    error: "https://pickme.alwaysdata.net/img/ordererror.png"
                };

                const topValue = '70px';
                const positions = `top: ${topValue};`;
                const iconSize = '28px';
                const fontSize = '14px';
                const sidePadding = mobileEnabled ? '30%' : '8px';

                ['success', 'error'].forEach(type => {
                    const icon = document.createElement('img');
                    icon.setAttribute('src', iconSources[type]);
                    icon.style.cssText = `position: absolute; ${positions} ${type === 'success' ? `left: ${sidePadding};` : `right: ${sidePadding};`} cursor: pointer; width: ${iconSize}; height: ${iconSize}; z-index: 10;`;

                    const count = document.createElement('span');
                    count.textContent = type === 'success' ? orderData.qty_orders_success : orderData.qty_orders_failed;
                    count.style.cssText = `position: absolute; ${positions} ${type === 'success' ? `left: ${sidePadding};` : `right: ${sidePadding};`} width: ${iconSize}; height: ${iconSize}; display: flex; align-items: center; justify-content: center; font-size: ${fontSize}; font-weight: bold; z-index: 20;`;

                    imageElement.parentElement.style.position = 'relative';
                    imageElement.parentElement.appendChild(icon);
                    imageElement.parentElement.appendChild(count);
                });
            }
        }

        //Pour afficher les commandes réussies ou non dans la liste des commandes
        async function showOrdersPercent(data) {
            const items = document.querySelectorAll('.vvp-orders-table--row');
            if (items.length === 0) return;

            for (const item of items) {
                const imageElement = item.querySelector('.vvp-orders-table--image-col img');
                let productLink = item.querySelector('.vvp-orders-table--text-col a');
                let url;

                if (!productLink) {
                    const asinElement = item.querySelector('.vvp-orders-table--text-col');
                    let asin = asinElement ? asinElement.childNodes[0].nodeValue.trim() : null;
                    url = "https://www.amazon.fr/dp/" + asin;
                } else {
                    url = productLink.href;
                }

                if (!imageElement || !url) continue;

                const orderData = data.find(d => d.url === url);
                if (!orderData) continue;

                const positions = mobileEnabled ? 'bottom: 10%;' : 'bottom: 10%;';
                const iconSize = mobileEnabled ? '28px' : '28px';
                const fontSize = mobileEnabled ? '14px' : '14px';
                const sidePadding = mobileEnabled ? '30%' : '8px';

                if (orderData.percentage !== null) {
                    const percent = document.createElement('span');
                    percent.textContent = orderData.percentage;
                    percent.style.cssText = `
        position: absolute;
        top: 5px;
        left: 50%;
        transform: translateX(-50%);
        padding: 2px 8px; /* Ajoute du padding pour le fond */
        background-color: rgba(255, 255, 255, 0.7); /* Fond transparent blanc */
        color: black;
        width: auto; /* La largeur s'adapte au contenu */
        height: auto; /* La hauteur s'adapte au contenu */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${fontSize};
        z-index: 20;
        border-radius: 4px; /* Arrondir légèrement les coins du fond */
    `;
                    imageElement.parentElement.style.position = 'relative';
                    imageElement.parentElement.appendChild(percent);
                }
            }
        }

        //Utilise les infos de RR pour avoir le nombre de commandes du jour
        function countOrdersToday() {
            const today = new Date().toLocaleDateString("fr-FR");
            let count = 0;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('order_')) {
                    const order = JSON.parse(localStorage.getItem(key));
                    if (order.orderDate === today) {
                        count++;
                    }
                }
            }
            return count;
        }

        function extractMonthYearFromDate(dateString) {
            const [day, month, year] = dateString.split('/').map(part => parseInt(part, 10));
            return { month: month - 1, year }; // mois est indexé à partir de 0 en JavaScript
        }

        //Utilise les infos de RR pour avoir le nombre de commandes du mois
        function countOrdersThisMonth() {
            const today = new Date();
            const currentMonth = today.getMonth(); // 0-indexed month
            const currentYear = today.getFullYear();
            let count = 0;

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('order_')) {
                    const order = JSON.parse(localStorage.getItem(key));
                    if (order.orderDate) {
                        const { month, year } = extractMonthYearFromDate(order.orderDate);
                        if (month === currentMonth && year === currentYear) {
                            count++;
                        }
                    }
                }
            }
            return count;
        }

        //Appel API pour synchroniser
        function syncProducts(askHide = true, hideAll = false, refresh = true) {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
            });

            return fetch("https://pickme.alwaysdata.net/shyrka/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                if (response.status === 401) {
                    alert("Clé API invalide ou membre non Premium+");
                    return response;
                }

                if (!response.ok) {
                    //Pour les autres statuts d'erreur
                    console.error("Erreur HTTP:", response.status, response.statusText);
                    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
                }

                //On tente de parser la réponse en JSON
                return response.json().catch(error => {
                    console.error("Erreur lors du parsing JSON:", error);
                    throw error;
                });
            })
                .then(productsData => {
                //Si on arrive ici, c'est qu'on a un code 2xx
                syncProductsData(productsData, askHide, hideAll, refresh);
                return productsData;
            })
                .catch(error => {
                console.error("Erreur de requête:", error);
                throw error;
            });
        }

        //Appel API pour la quantité de produits
        function qtyProducts() {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
            });

            return fetch("https://pickme.alwaysdata.net/shyrka/qtyproducts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                if (response.status === 401) {
                    return response;
                }

                if (!response.ok) {
                    //Erreur HTTP (ex: 404, 500, etc.)
                    console.error("Erreur HTTP:", response.status, response.statusText);
                    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
                }

                //Réponse 2xx, on essaie de parser le JSON
                return response.json().catch(error => {
                    console.error("Erreur lors du parsing JSON:", error);
                    throw error;
                });
            })
                .then(productsData => {
                //On a réussi à parser le JSON, on appelle qtyProductsData
                qtyProductsData(productsData);
                return productsData;
            })
                .catch(error => {
                //Erreur réseau ou de parsing déjà gérée ci-dessus
                console.error("Erreur de requête:", error);
                throw error;
            });
        }

        //Affichage des données reçu par l'API, le délai est pour avoir le bon ordre d'affichage
        function qtyProductsData(productsData) {
            const infoContainer = createInfoContainer();

            // Trouve ou crée le div pour les produits
            let productsDiv = document.getElementById('products-info');
            if (!productsDiv) {
                productsDiv = document.createElement('div');
                productsDiv.id = 'products-info';
                productsDiv.style.padding = '0';
                productsDiv.style.margin = '0';
                infoContainer.appendChild(productsDiv);
            }

            // Ajoute les informations au div
            productsDiv.innerHTML = `
        <p style="margin:0; font-weight: bold; text-decoration: underline;">Nouveaux produits</p>
        <p style="margin:0;">Autres articles : ${productsData[0].ai}${productsData[0].ai_recent !== '0' ? `<span style="color: green;"> (+${productsData[0].ai_recent})</span>` : ''}</p>
        <p style="margin:0;">Disponible pour tous : ${productsData[0].afa}${productsData[0].afa_recent !== '0' ? `<span style="color: green;"> (+${productsData[0].afa_recent})</span>` : ''}</p>
        <p style="margin:0;">Total jour : ${productsData[0].total}</p>
        <p style="margin:0;">Total mois : ${productsData[0].total_month}</p>
    `;
        }

        //Appel API pour commandes du jour
        function qtyOrders() {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
            });

            return fetch("https://pickme.alwaysdata.net/shyrka/qtyorders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                if (response.status === 401) {
                    return response;
                }

                if (!response.ok) {
                    //Erreur HTTP (ex: 404, 500, etc.)
                    console.error("Erreur HTTP:", response.status, response.statusText);
                    throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
                }

                //Réponse 2xx, on essaie de parser le JSON
                return response.json().catch(error => {
                    console.error("Erreur lors du parsing JSON:", error);
                    throw error;
                });
            })
                .then(ordersData => {
                //On a réussi à parser le JSON, on appelle qtyOrdersData
                qtyOrdersData(ordersData);
                return ordersData;
            })
                .catch(error => {
                //Erreur réseau ou de parsing déjà gérée ci-dessus
                console.error("Erreur de requête:", error);
                throw error;
            });
        }

        function detectTier() {
            var silverElement = document.getElementById("vvp-silver-tier-label");
            var goldElement = document.getElementById("vvp-gold-tier-label");
            var tier;

            if (silverElement && silverElement.textContent.includes("Argent")) {
                tier = "silver";
            } else if (goldElement && goldElement.textContent.includes("Or")) {
                tier = "gold";
            } else {
                tier = null; // Pas de correspondance trouvée
            }

            return tier;
        }

        //Affichage des données reçu par l'API
        function qtyOrdersData(ordersData) {
            const infoContainer = createInfoContainer();

            // Trouve ou crée le div pour les commandes
            let ordersDiv = document.getElementById('orders-info');
            if (!ordersDiv) {
                ordersDiv = document.createElement('div');
                ordersDiv.id = 'orders-info';
                ordersDiv.style.padding = '0';
                ordersDiv.style.margin = '0';
                infoContainer.appendChild(ordersDiv);
            }

            //const ordersMonth = countOrdersThisMonth();
            //const ordersToday = countOrdersToday();

            // Détermine les valeurs à afficher
            //const displayOrdersToday = ordersToday > ordersData.qty_orders_today ? ordersToday : ordersData.qty_orders_today;
            //const displayOrdersMonth = ordersMonth > ordersData.qty_orders_month ? ordersMonth : ordersData.qty_orders_month;
            var tier = detectTier();
            // Détermine le suffixe basé sur le tier
            const suffix = tier === 'gold' ? '/8' : '/3';
            const displayOrdersTodayWithSuffix = `${ordersData.qty_orders_today}${suffix}`;
            // Ajoute les informations au div
            ordersDiv.innerHTML = `
        <p style="margin:0; font-weight: bold; text-decoration: underline;">Mes commandes</p>
        <p style="margin:0;">Aujourd'hui : ${displayOrdersTodayWithSuffix} (${ordersData.sum_price_today} €)</p>
        <p style="margin:0; ${statsEnabled ? 'margin-bottom: 1em;' : ''}">Mois en cours : ${ordersData.qty_orders_month} (${ordersData.sum_price_month} €)</p>
    `;
        }

        //Conteneur des stats premium+
        function createInfoContainer() {
            // Trouve le conteneur principal
            const container = document.getElementById('vvp-browse-nodes-container');

            // Crée un conteneur parent pour les informations s'il n'existe pas
            let infoContainer = document.getElementById('info-container');
            if (!infoContainer) {
                infoContainer = document.createElement('div');
                infoContainer.id = 'info-container';
                infoContainer.style.border = '3px solid #ccc';
                infoContainer.style.padding = '10px';
                infoContainer.style.marginTop = '10px';
                infoContainer.style.marginBottom = '10px';
                infoContainer.style.display = 'none';
                infoContainer.style.width = 'fit-content';
                infoContainer.style.whiteSpace = 'nowrap';
                infoContainer.style.borderRadius = '10px';

                // Insère le conteneur au bon endroit, sous le bouton "Afficher tout"
                if (container) {
                    const referenceNode = container.querySelector('p');
                    if (referenceNode) {
                        container.insertBefore(infoContainer, referenceNode.nextSibling);
                    } else {
                        container.appendChild(infoContainer);
                    }
                }
            }

            return infoContainer;
        }

        //Ajout des données reçu par l'API pour synchroniser
        function syncProductsData(productsData, askHide = true, hideAll = false, refresh = true) {
            let userHideAll;
            if (askHide) {
                userHideAll = confirm("Voulez-vous également cacher tous les produits ? OK pour oui, Annuler pour non.");
            } else {
                if (hideAll) {
                    userHideAll = true;
                } else {
                    userHideAll = false;
                }
            }
            let storedProducts = JSON.parse(GM_getValue("storedProducts", "{}"));
            productsData.forEach(product => {
                const asin = product.asin;
                const currentDate = product.date_ajout;
                const enrollment = product.enrollment;
                const hideKey = getAsinEnrollment(asin, enrollment);
                if (userHideAll) {
                    const etatFavoriKey = asin + '_f';
                    const etatFavori = localStorage.getItem(etatFavoriKey) || '0';
                    if (etatFavori === '0') { //Ne modifie l'état de caché que si le produit n'est pas en favori
                        const etatCacheKey = asin + '_c';
                        localStorage.setItem(etatCacheKey, '1');
                    }
                }
                // Mettre à jour ou ajouter le produit dans storedProducts
                if (storedProducts[asin]) {
                    // Si le produit existe déjà, on met uniquement à jour la date
                    storedProducts[asin].dateAdded = currentDate;
                } else {
                    // Sinon, on ajoute le produit
                    storedProducts[asin] = {
                        added: true, // Marquer le produit comme ajouté
                        enrollmentKey: hideKey, // Key pour la fonction cacher
                        dateAdded: currentDate // Utilisez la date d'ajout fournie par l'API
                    };
                }
            });

            // Sauvegarder les changements dans storedProducts
            GM_setValue("storedProducts", JSON.stringify(storedProducts));
            if (askHide) {
                alert("Les produits ont été synchronisés.");
            }
            if (refresh) {
                window.location.reload();
            }
        }
        //End

        // Determining the queue type from the HTML dom
        function d_queueType(text) {
            switch (text) {
                case "VENDOR_TARGETED":
                    return "potluck"; // RFY
                case "VENDOR_VINE_FOR_ALL":
                    return "last_chance"; // AFA
                case "VINE_FOR_ALL":
                    return "encore"; // AI
                default:
                    return null;
            }
        }

        let parentAsin, parentImage, parentEnrollment, queueType;

        //As much as I hate this, this adds event listeners to all of the "See details" buttons
        document.querySelectorAll('.a-button-primary.vvp-details-btn > .a-button-inner > input').forEach(function(element) {
            element.addEventListener('click', function() {

                parentAsin = this.getAttribute('data-asin');
                parentImage = this.parentElement.parentElement.parentElement.querySelector('img').src.match(PRODUCT_IMAGE_ID)[1];
                parentEnrollment = getEnrollment(this);
                queueType = urlData?.[2] || d_queueType(this.getAttribute('data-recommendation-type'));

                //silencing console errors; a null error is inevitable with this arrangement; I might fix this in the future
                try {
                    document.querySelector("button.a-button-discord").style.display = 'none'; // hiding the button until the modal content loads
                } catch (error) {
                }
            });
        });

        window.addEventListener('load', function () {
            var target, observer, config;
            //On observe si on ouvre le détail d'un produit
            target = document.querySelector("a#vvp-product-details-modal--product-title");

            config = {
                characterData: false,
                attributes: true,
                childList: false,
                subtree: false
            };

            // Mutation observer fires every time the product title in the modal changes
            observer = new MutationObserver(function (mutations) {

                if (!document.querySelector('.a-button-discord')) {
                    addShareButton();
                }

                document.querySelector("button.a-button-discord").style.display = 'inline-flex';

                // remove pre-existing event listener before creating a new one
                document.querySelector("button.a-button-discord")?.removeEventListener("click", buttonHandler);

                // making sure there aren't any errors in the modal
                var hasError = !Array.from(errorMessages).every(function(elem) {
                    return elem.style.display === 'none';
                });
                var wasPosted = GM_getValue("config")[parentAsin]?.queue;
                var isModalHidden = (document.querySelector("a#vvp-product-details-modal--product-title").style.visibility === 'hidden') ? true : false;

                if (hasError || queueType == null || queueType == "potluck" || window.location.href.includes('?search')) {
                    //Cacher le bouton si reco, reco ou autres
                    document.querySelector("button.a-button-discord").style.display = 'none';
                } else if (wasPosted === queueType) {
                    //Produit déjà posté
                    updateButtonIcon(4);
                } else if (!isModalHidden) {
                    updateButtonIcon(0);
                }
                if (fastCmdEnabled) {
                    document.querySelector("button.a-button-discord").addEventListener("click", buttonHandler);
                    focusButton('input.a-button-input[aria-labelledby="vvp-product-details-modal--request-btn-announce"]', 0);
                    // Mettre le focus sur le bouton "Envoyer à cette adresse"
                    observeShippingModal();
                }
            });

            try {
                observer.observe(target, config);
            } catch(error) {
                console.log('Aucun produit sur cette page');
            }

            function focusButton(selector, timeout = 300) {
                var button = document.querySelector(selector);
                if (button && document.activeElement !== button) {
                    // Faire défiler pour s'assurer que le bouton est visible
                    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Attendre un court instant avant de mettre le focus
                    setTimeout(function () {
                        // Mettre le focus sur le bouton
                        button.focus();
                        // Forcer le focus si nécessaire
                        if (document.activeElement !== button) {
                            button.setAttribute('tabindex', '-1'); // Rendre le bouton focusable si ce n'est pas déjà le cas
                            button.focus();
                        }
                    }, timeout);
                }
            }

            function observeShippingModal() {
                var shippingModalTarget = document.querySelector("#vvp-shipping-address-modal");

                if (shippingModalTarget) {
                    var shippingObserver = new MutationObserver(function (mutations) {
                        focusButton('input.a-button-input[aria-labelledby="vvp-shipping-address-modal--submit-btn-announce"]');
                    });

                    var shippingConfig = {
                        characterData: false,
                        attributes: true,
                        childList: false,
                        subtree: false
                    };

                    try {
                        shippingObserver.observe(shippingModalTarget, shippingConfig);
                    } catch (error) {
                        console.log('Erreur lors de l\'observation du modal de l\'adresse d\'expédition');
                    }
                }
            }

            /*function observeShippingModal() {
                var shippingModalObserver = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if (mutation.addedNodes.length > 0) {
                            mutation.addedNodes.forEach(function (node) {
                                if (node.nodeType === 1 && node.matches('#vvp-shipping-address-modal--submit-btn')) {
                                    // Focus sur le bouton "Envoyer à cette adresse"
                                    focusButton('input.a-button-input[aria-labelledby="vvp-shipping-address-modal--submit-btn-announce"]');
                                }
                            });
                        }
                    });
                });

                var shippingModalTarget = document.querySelector("#vvp-shipping-address-modal");

                if (shippingModalTarget) {
                    shippingModalObserver.observe(shippingModalTarget, {
                        childList: true,
                        subtree: true
                    });
                } else {
                    console.log('Le modal d\'adresse d\'expédition n\'a pas été trouvé');
                }
            }*/

        });

        //Afficher le nom complet du produit
        if (extendedEnabled && apiOk) {
            function tryExtended() {
                const itemTiles = document.querySelectorAll('.vvp-item-tile');
                if (itemTiles.length > 0) {
                    document.querySelectorAll('.vvp-item-tile').forEach(function(tile) {
                        const fullTextElement = tile.querySelector('.a-truncate-full.a-offscreen');
                        const cutTextElement = tile.querySelector('.a-truncate-cut');
                        if (fullTextElement && cutTextElement && fullTextElement.textContent) {
                            if (!cssEnabled) {
                                cutTextElement.textContent = fullTextElement.textContent;
                                //Appliquez les styles directement pour surmonter les restrictions CSS
                                cutTextElement.style.cssText = 'height: auto !important; max-height: none !important; overflow: visible !important; white-space: normal !important;';
                            } else {
                                document.addEventListener('mouseover', function(event) {
                                    //Vérifie si la cible est dans le conteneur souhaité
                                    const target = event.target.closest('.vvp-item-product-title-container');
                                    if (target) {
                                        const fullTextElement = target.querySelector('.a-truncate-full.a-offscreen');
                                        if (fullTextElement) {
                                            const fullText = fullTextElement.textContent;

                                            //Crée le popup
                                            const popup = document.createElement('div');
                                            popup.textContent = fullText;
                                            popup.style.position = 'fixed';
                                            popup.style.maxWidth = '300px';
                                            popup.style.wordWrap = 'break-word';
                                            if (savedTheme == "dark") {
                                                popup.style.backgroundColor = '#fff';
                                                popup.style.color = 'rgba(0, 0, 0, 0.8)';
                                            } else {
                                                popup.style.backgroundColor = 'rgb(25, 25, 25)';
                                                popup.style.color = '#fff';
                                            }
                                            popup.style.padding = '5px 10px';
                                            popup.style.borderRadius = '5px';
                                            popup.style.zIndex = '1000';
                                            popup.style.pointerEvents = 'none';

                                            //Positionne le popup près du curseur
                                            document.body.appendChild(popup);
                                            const movePopup = (e) => {
                                                popup.style.top = `${e.clientY + 10}px`;
                                                popup.style.left = `${e.clientX + 10}px`;
                                            };
                                            movePopup(event); //Place le popup initialement
                                            document.addEventListener('mousemove', movePopup);

                                            //Supprime le popup lorsque la souris quitte
                                            const removePopup = () => {
                                                popup.remove();
                                                document.removeEventListener('mousemove', movePopup);
                                                target.removeEventListener('mouseleave', removePopup);
                                            };
                                            target.addEventListener('mouseleave', removePopup);
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    setTimeout(tryExtended, 100);
                }

                if (!cssEnabled) {
                    //Appliquez des styles plus spécifiques pour surmonter les restrictions CSS
                    document.querySelectorAll('.vvp-item-tile .a-truncate').forEach(function(element) {
                        element.style.cssText = 'max-height: 5.6em !important;';
                    });
                }
            }
            setTimeout(tryExtended, 600);
            //tryExtended();
        }

        //Wheel Fix
        if (apiOk) {
            if (wheelfixEnabled || ordersEnabled) {
                const script = document.createElement('script');
                script.textContent = `
                function showMagicStars() {
                    var style = document.createElement('style');
                    style.innerHTML = \`
            @keyframes sparkle {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(1); opacity: 0; }
            }
            .star {
                position: fixed;
                font-size: 60px; /* Plus grand */
                animation: sparkle 3s forwards; /* Durée plus longue */
                animation-timing-function: ease-out;
                z-index: 999999; /* Très élevé */
            }
            .magic-text {
                position: fixed;
                top: 30%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 40px;
                color: #000099;
           text-shadow:
              -1px -1px 0 #000,
               1px -1px 0 #000,
              -1px  1px 0 #000,
               1px  1px 0 #000; /* Contour noir */
                z-index: 1000000; /* Encore plus élevé */
                animation: fadeInOut 4s forwards; /* Animation pour le texte */
            }
            @keyframes fadeInOut {
                0% { opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { opacity: 0; }
            }
        \`;
                    document.head.appendChild(style);

                    var symbolColorPairs = [
                        { symbol: '★', color: '#FFD700' },
                        { symbol: '❆', color: '#07EEFD' },
                        { symbol: '🐱', color: '#FFD700' },
                        { symbol: '🔥', color: '#FFD700' },
                        { symbol: '🦆', color: '#FFD700' },
                        { symbol: '🐝', color: '#FFD700' },
                        { symbol: '🐧', color: '#FFD700' },
                        { symbol: '🥚', color: '#FFD700' },
                        { symbol: '❤', color: '#FF69B4' }
                    ];

                    // Créer le texte "PickMe Fix"
                    var magicText = document.createElement('div');
                    magicText.className = 'magic-text';
                    magicText.textContent = 'PickMe Fix';
                    document.body.appendChild(magicText);

                    // Supprimer le texte après 3 secondes
                    setTimeout(() => {
                        document.body.removeChild(magicText);
                    }, 3000);
                    let index = Math.floor(Math.random() * symbolColorPairs.length);
                    let pair = symbolColorPairs[index];
                    // Créer et afficher le symbole
                    for (let i = 0; i < 50; i++) {
                        let star = document.createElement('div');
                        star.className = 'star';
                        star.textContent = pair.symbol;
                        star.style.color = pair.color;
                        star.style.top = \`\${Math.random() * window.innerHeight}px\`;
                        star.style.left = \`\${Math.random() * window.innerWidth}px\`;
                        document.body.appendChild(star);

                        // Supprimer l'étoile après l'animation
                        setTimeout(() => {
                            document.body.removeChild(star);
                        }, 3000 + Math.random() * 500);
                    }
                }

                const API_TOKEN = ${JSON.stringify(API_TOKEN)};
                const version = ${JSON.stringify(version)};
                const valeurQueue = ${JSON.stringify(valeurQueue)};
                const ordersEnabled = ${JSON.stringify(ordersEnabled)};
                const wheelfixEnabled = ${JSON.stringify(wheelfixEnabled)};
                const origFetch = window.fetch;
                var lastParentVariant = null;
                var responseData = {};
                var postData = {};
                window.fetch = async (...args) => {
                    let response = await origFetch(...args);
                    let lastParent = lastParentVariant;
                    let regex = null;

                    const url = args[0] || "";
                    if (ordersEnabled) {
                        if (url.startsWith("api/voiceOrders")) {
                            postData = JSON.parse(args[1].body);
                            const asin = postData.itemAsin;

                            try {
                                responseData = await response.clone().json();
                            } catch (e) {
                                console.error(e);
                            }

                            if (lastParent != null) {
                                regex = /^.+?#(.+?)#.+$/;
                                lastParent = lastParentVariant.recommendationId.match(regex)[1];
                            }

                            let formData = new URLSearchParams({
                                version: version,
                                token: API_TOKEN,
                                parent_asin: lastParent,
                                asin: asin,
                                queue: valeurQueue,
                                success: "success",
                            });
                            if (responseData.error !== null) {
                                formData = new URLSearchParams({
                                    version: version,
                                    token: API_TOKEN,
                                    parent_asin: lastParent,
                                    asin: asin,
                                    queue: valeurQueue,
                                    success: "failed",
                                    reason: responseData.error, //CROSS_BORDER_SHIPMENT, SCHEDULED_DELIVERY_REQUIRED, ITEM_NOT_IN_ENROLLMENT, ITEM_ALREADY_ORDERED
                                });
                                //Sélectionner tous les éléments avec la classe "a-alert-content"
                                var alertContents = document.querySelectorAll('.a-alert-content');

                                //Texte à ajouter en gras avec un retour à la ligne avant
                                var texteAAjouter = "<br><strong>(PickMe) Code erreur : " + responseData.error + "</strong> (<a href='https://pickme.alwaysdata.net/wiki/doku.php?id=plugins:pickme:codes_erreur' target='_blank'>wiki des codes d'erreurs</a>)";

                                //Parcourir tous les éléments sélectionnés
                                alertContents.forEach(function(alertContent) {
                                    //Ajouter le texte après le contenu actuel
                                    alertContent.innerHTML += texteAAjouter;
                                });
                            }

                            fetch("https://pickme.alwaysdata.net/shyrka/order", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                                body: formData.toString()
                            });

                            //Attendre 500ms après la commande pour laisser le temps au serveur de traiter avant la redirection.
                            await new Promise((r) => setTimeout(r, 500));

                            return response;
                        }
                    }

                    regex = new RegExp("^api/recommendations/.*$");
                    if (url.startsWith("api/recommendations")) {
                        try {
                            responseData = await response.clone().json();
                        } catch (e) {
                            console.error(e);
                        }

                        let { result, error } = responseData;

                        if (result === null) {
                            return response;
                        }

                        if (result.variations !== undefined) {
                            //The item has variations and so is a parent, store it for later interceptions
                            lastParentVariant = result;
                        } else if (result.taxValue !== undefined) {
                            //The item has an ETV value, let's find out if it's a child or a parent
                            const isChild = !!lastParent?.variations?.some((v) => v.asin == result.asin);
                            var asinData = result.asin;
                            //On test si le produit a des variantes, on récupère le parent pour notre base de données
                            if (isChild) {
                                regex = /^.+?#(.+?)#.+$/;
                                let arrMatchesP = lastParent.recommendationId.match(regex);
                                asinData = arrMatchesP[1];
                            }

                            function returnVariations() {
                                var variations = {};

                                document.querySelectorAll('#vvp-product-details-modal--variations-container .vvp-variation-dropdown').forEach(function(elem) {

                                    const type = elem.querySelector('h5').innerText;
                                    const names = Array.from(elem.querySelectorAll('.a-dropdown-container select option')).map(function(option) {
                                        return option.innerText.replace(/[*_~|\`]/g, '\\$&');
                                    });
                                    variations[type] = names;
                                });
                                return variations;
                            }

                            function nbVariations(obj) {
                                let total = 1;
                                for (const key in obj) {
                                    if (Array.isArray(obj[key]) && obj[key].length > 0) {
                                        total *= obj[key].length;
                                    }
                                }
                                return total;
                            }

                            var variations = returnVariations();
                            variations = (Object.keys(variations).length > 0) ? variations : null;

                            var formDataETV = new URLSearchParams({
                                version: version,
                                token: API_TOKEN,
                                asin: asinData,
                                etv: result.taxValue,
                                queue: valeurQueue,
                                limited: result.limitedQuantity,
                                seller: result.byLineContributors[0],
                                variations: JSON.stringify(variations),
                                nb_variations: nbVariations(variations),
                            });
                            if (ordersEnabled) {
                                fetch("https://pickme.alwaysdata.net/shyrka/newetv", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/x-www-form-urlencoded"
                                    },
                                    body: formDataETV.toString()
                                });
                            }
                        }
                        if (wheelfixEnabled) {
                            let fixed = 0;
                            //Fix automatique du fix qu'on peut faire à la main
                            /*let timeoutId = setTimeout(function() {
                                var spinner = document.querySelector('.a-spinner.a-spinner-medium');
                                if (spinner) {
                                    let parent = spinner.parentNode;
                                    spinner.remove();

                                    var modalWrapper = document.getElementById('vvp-product-details-modal--spinner');

                                    var container = document.createElement('div');
                                    container.style.textAlign = 'center';
                                    modalWrapper.appendChild(container);

                                    // Créer le texte du titre
                                    var title = document.createElement('p');
                                    title.textContent = 'PickMe Fix';
                                    title.style.fontSize = '24px';
                                    title.style.fontWeight = 'bold';
                                    title.style.marginBottom = '10px';
                                    title.style.textAlign = 'center';
                                    title.style.fontFamily = 'Arial, sans-serif';
                                    container.appendChild(title);

                                    // Créer le texte explicatif sous le titre
                                    var explanationText = document.createElement('p');
                                    explanationText.textContent = "Pour corriger ce produit, il faut choisir la variation souhaitée et cliquer sur le bouton 'Corriger ce produit'. Il suffit ensuite d'ouvrir à nouveau les détails du produit pour le commander.";
                                    explanationText.style.fontSize = '14px';
                                    explanationText.style.marginBottom = '20px';
                                    explanationText.style.textAlign = 'center';
                                    explanationText.style.lineHeight = '1.5';
                                    container.appendChild(explanationText);

                                    // Créer la liste déroulante
                                    var select = document.createElement('select');
                                    select.style.marginBottom = '15px';
                                    container.appendChild(select);

                                    // Parcourir les variations pour les ajouter à la liste
                                    result.variations.forEach(function(variation) {
                                        var option = document.createElement('option');
                                        option.value = variation.asin;
                                        option.textContent = Object.values(variation.dimensions).join(', ');
                                        select.appendChild(option);
                                    });

                                    // Créer le bouton sous la liste
                                    var buttonWrapper = document.createElement('span');
                                    buttonWrapper.className = "a-declarative";
                                    buttonWrapper.setAttribute("data-action", "vvp-hide-modal");
                                    buttonWrapper.setAttribute("data-csa-c-type", "widget");
                                    buttonWrapper.setAttribute("data-csa-c-func-deps", "aui-da-vvp-hide-modal");
                                    buttonWrapper.setAttribute("data-vvp-hide-modal", "{}");

                                    var button = document.createElement('span');
                                    button.className = "a-button a-button-primary";

                                    var buttonInner = document.createElement('span');
                                    buttonInner.className = "a-button-inner";

                                    var buttonInput = document.createElement('input');
                                    buttonInput.className = "a-button-input";
                                    buttonInput.type = "submit";
                                    buttonInput.setAttribute("aria-labelledby", "vvp-product-details-modal--back-btn-announce");

                                    var buttonText = document.createElement('span');
                                    buttonText.className = "a-button-text";
                                    buttonText.id = "vvp-product-details-modal--back-btn-announce";
                                    buttonText.textContent = "Corriger ce produit";

                                    // Assembler le bouton
                                    buttonInner.appendChild(buttonInput);
                                    buttonInner.appendChild(buttonText);
                                    button.appendChild(buttonInner);
                                    buttonWrapper.appendChild(button);

                                    // Ajouter un retour à la ligne pour le bouton
                                    var br = document.createElement('br');
                                    container.appendChild(br);

                                    container.appendChild(buttonWrapper);

                                    // Sélectionner les boutons
                                    const backButton = document.querySelector('#vvp-product-details-modal--back-btn');
                                    const closeButton = document.querySelector('button.a-button-close');

                                    // Fonction qui supprime le contenu de modalWrapper
                                    function clearModalContent() {
                                        // Supprimer tout ce qu'on a ajouté comme texte ou menu déroulant
                                        while (modalWrapper.firstChild) {
                                            modalWrapper.removeChild(modalWrapper.firstChild);
                                        }

                                        // Supprimer les écouteurs pour éviter que cela ne se refasse
                                        backButton.removeEventListener('click', clearModalContent);
                                        closeButton.removeEventListener('click', clearModalContent);
                                        parent.appendChild(spinner);
                                        // Annuler le timer en cours
                                        clearTimeout(timeoutId);
                                    }

                                    // Ajouter un écouteur d'événement sur les deux boutons
                                    backButton.addEventListener('click', clearModalContent);
                                    closeButton.addEventListener('click', clearModalContent);

                                    // Ajouter l'événement de clic au bouton
                                    buttonInput.addEventListener('click', function() {
                                        showMagicStars();
                                        var recommendationId = result.recommendationId;
                                        var selectedAsin = select.value;
                                        var recommendationInputs = document.querySelectorAll('input[data-recommendation-id]');
                                        recommendationInputs.forEach(function(input) {
                                            if (input.getAttribute('data-recommendation-id') === recommendationId) {
                                                input.setAttribute('data-asin', selectedAsin);
                                                input.setAttribute('data-is-parent-asin', 'false');
                                                input.setAttribute('data-recommendation-id', recommendationId);
                                            }
                                        });

                                        // Supprimer tout ce qu'on a ajouté comme texte ou menu déroulant
                                        while (modalWrapper.firstChild) {
                                            modalWrapper.removeChild(modalWrapper.firstChild);
                                        }

                                        // Simuler le clic sur le bouton "Retour" pour fermer le modal
                                        var returnButton = document.querySelector('[data-action="vvp-hide-modal"]');
                                        if (returnButton) {
                                            returnButton.click();
                                        }
                                        parent.appendChild(spinner);
                                    });
                                }
                            }, 3000); // 3000 millisecondes = 3 secondes*/

                            result.variations = result.variations?.map((variation) => {
                                if (Object.keys(variation.dimensions || {}).length === 0) {
                                    variation.dimensions = {
                                        asin_no: variation.asin,
                                    };
                                    fixed++;
                                    return variation;
                                }

                                for (const key in variation.dimensions) {
                                    // Sauvegarder la valeur d'origine
                                    let originalValue = variation.dimensions[key]; //

                                    //Échapper les caractères spéciaux
                                    variation.dimensions[key] = variation.dimensions[key]
                                        .replace(new RegExp("&", "g"), "&amp;")
                                        .replace(new RegExp("<", "g"), "&lt;")
                                        .replace(new RegExp(">", "g"), "&gt;")
                                        .replace(new RegExp('"', "g"), "&quot;")
                                        .replace(new RegExp("'", "g"), "&#039;")
                                        .replace(new RegExp("°", "g"), "&#176;")
                                        .replace(new RegExp("\\\\(", "g"), "|")
                                         .replace(new RegExp("\\\\)", "g"), "|")
                                        .replace(new RegExp(",", "g"), "");

                                    //Si la valeur a changé, on incrémente fixed
                                    if (originalValue !== variation.dimensions[key]) {
                                        fixed++;
                                    }

                                    if (!variation.dimensions[key].match(/[a-zà-ÿ0-9]$/i)) {
                                        variation.dimensions[key] = variation.dimensions[key];
                                        fixed++;
                                    }

                                    // Ajout d'un espace après ':' ou ')' si nécessaire
                                    variation.dimensions[key] = variation.dimensions[key].replace(/([:)])([^\s])/g, "$1 $2");

                                    // Suppression de l'espace avant un '/'
                                    variation.dimensions[key] = variation.dimensions[key].replace(/(\s[/])/g, "/");
                                }

                                return variation;
                            });

                            if (fixed > 0) {
                                showMagicStars();
                            }

                            return new Response(JSON.stringify(responseData));
                        }
                    }
                    return response;
                };`;
                document.documentElement.appendChild(script);
                script.remove();
            }

            function isObjectEmpty(obj) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            }
        }
        //End Wheel Fix

        //Sauvegarder/Restaurer
        //Fonction pour récupérer les données de localStorage
        function getLocalStorageData() {
            let data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.endsWith('_c') || key.endsWith('_f')) {
                    data[key] = localStorage.getItem(key);
                }
            }
            return data;
        }

        //Fonction pour restaurer les données dans localStorage
        function setLocalStorageData(data) {
            for (let key in data) {
                if (key.endsWith('_c') || key.endsWith('_f')) {
                    localStorage.setItem(key, data[key]);
                }
            }
        }

        async function saveData() {
            try {
                // Récupérez toutes les clés sauvegardées
                const keys = GM_listValues();
                let data = {};

                // Exclure les paramètres propres à un appareil
                const excludedKeys = [
                    'mobileEnabled', 'cssEnabled', 'fastCmdEnabled', 'onMobile',
                    'ordersEnabled', 'ordersStatsEnabled', 'ordersInfos',
                    'lastVisit', 'hideBas'
                ];

                keys.forEach(key => {
                    if (!excludedKeys.includes(key)) {
                        data[key] = GM_getValue(key);
                    } else {
                        console.log(`Exclusion de la clé : ${key}`);
                    }
                });

                // Ajouter les données de localStorage
                const localStorageData = getLocalStorageData();
                data = { ...data, ...localStorageData };

                // Préparation des données pour l'envoi
                const formData = {
                    version: version,
                    token: API_TOKEN,
                    settings: data,
                };

                // Effectuer la requête fetch
                const response = await fetch("https://pickme.alwaysdata.net/shyrka/save", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                // Vérifier la réponse
                if (!response.ok) {
                    throw new Error(`Erreur lors de la sauvegarde : ${response.status} ${response.statusText}`);
                }

                const responseData = await response.json();
                console.log("Sauvegarde réussie");

                // Gérer les données de réponse
                if (responseData.lastSaveDate) {
                    const restoreButton = document.getElementById('restoreData');
                    restoreButton.textContent = `(Premium) Restaurer les paramètres/produits (${convertToEuropeanDate(responseData.lastSaveDate)})`;
                    restoreButton.removeAttribute('disabled');
                } else {
                    console.error("La date de la dernière sauvegarde n'a pas été retournée.");
                }
            } catch (error) {
                console.error("Erreur lors de la sauvegarde :", error);
            }
        }

        async function restoreData() {
            try {
                const formData = new URLSearchParams({
                    version: version,
                    token: API_TOKEN,
                });

                const response = await fetch("https://pickme.alwaysdata.net/shyrka/restore", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData.toString()
                });

                if (!response.ok) {
                    throw new Error(`Erreur lors de la restauration : ${response.status} ${response.statusText}`);
                }

                const data = await response.json();

                const restoreSettings = confirm("Souhaitez-vous restaurer les paramètres ? (certains paramètres incompatibles entre eux ne sont pas pris en charge par cette fonction)");
                const restoreProducts = confirm("Souhaitez-vous restaurer les produits (surbrillance + visibilité cachée/visible) ?");

                for (const key in data) {
                    if (key.endsWith('_c') || key.endsWith('_f')) {
                        if (restoreProducts) {
                            localStorage.setItem(key, data[key]);
                        }
                    } else {
                        if (restoreSettings) {
                            GM_setValue(key, data[key]);
                        }
                    }
                }

                if (restoreSettings || restoreProducts) {
                    console.log("Restauration réussie");
                    alert("Restauration réussie");
                    window.location.reload();
                } else {
                    console.log("Restauration annulée");
                    alert("Restauration annulée");
                }
            } catch (error) {
                console.error("Erreur lors de la restauration :", error);
            }
        }

        async function lastSave() {
            try {
                const formData = new URLSearchParams({
                    version: version,
                    token: API_TOKEN,
                });

                const response = await fetch("https://pickme.alwaysdata.net/shyrka/lastsave", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData.toString()
                });

                if (response.status === 200) {
                    const data = await response.json();
                    const europeanDate = convertToEuropeanDate(data.lastSaveDate);
                    return europeanDate;
                } else if (response.status === 201) {
                    return "Aucune sauvegarde";
                } else {
                    throw new Error("Erreur lors de la récupération de la dernière sauvegarde");
                }
            } catch (error) {
                throw new Error("Erreur lors de la récupération de la dernière sauvegarde : " + error);
            }
        }
        //End sauvegarde

        //Reload pour reco horaire
        function reloadAtNextFullHour() {

            const getRandomInteger = (min, max) => {
                min = Math.ceil(min)
                max = Math.floor(max)

                return Math.floor(Math.random() * (max - min)) + min
            }

            const now = new Date();

            // Calculer combien de temps il reste jusqu'à la prochaine heure ronde
            const nextHour = new Date();
            nextHour.setHours(now.getHours() + 1);
            nextHour.setMinutes(0);
            var randomSec = getRandomInteger(3,8);
            nextHour.setSeconds(randomSec);
            nextHour.setMilliseconds(0);

            const timeUntilNextHour = nextHour - now;

            // Créer l'élément pour afficher le décompte
            const countdownDiv = document.createElement('div');
            countdownDiv.style.position = 'fixed';
            if (headerEnabled) {
                countdownDiv.style.top = '10px';
            } else {
                countdownDiv.style.top = '140px';
            }
            countdownDiv.style.left = '50%';
            countdownDiv.style.transform = 'translateX(-50%)';
            countdownDiv.style.backgroundColor = 'rgba(0, 0, 0, 1)';
            countdownDiv.style.color = 'white';
            countdownDiv.style.padding = '10px';
            countdownDiv.style.borderRadius = '5px';
            countdownDiv.style.zIndex = '9999'; // S'assurer qu'il est au-dessus
            document.body.appendChild(countdownDiv);

            // Fonction pour mettre à jour le décompte
            function updateCountdown() {
                const now = new Date();
                const timeLeft = nextHour - now;
                if (timeLeft <= 0) {
                    countdownDiv.textContent = 'Actualisation...';
                    clearInterval(countdownInterval);
                } else {
                    const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
                    const seconds = Math.floor((timeLeft / 1000) % 60);
                    countdownDiv.textContent = `Prochaine actualisation : ${minutes} min. ${seconds} sec.`;
                }
            }

            // Mettre à jour le décompte toutes les secondes
            const countdownInterval = setInterval(updateCountdown, 1000);

            // Mise à jour initiale
            updateCountdown();

            // Définir un timeout pour recharger la page à l'heure pleine
            setTimeout(function() {
                location.reload(); // recharge la page
            }, timeUntilNextHour);
        }

        // Appeler la fonction immédiatement au chargement de la page
        if (recoHReload && valeurQueue == "potluck" && apiOk) {
            reloadAtNextFullHour();
        }

        if (autohideEnabled) {
            setTimeout(displayContent, 600);
        } else {
            displayContent();
        }
    }

    //Fix iPhone
    if (document.readyState !== 'loading') {
        runPickMe();
    }
    else {
        document.addEventListener('DOMContentLoaded', function () {
            runPickMe();
        });
    }
})();
