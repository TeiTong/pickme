// ==UserScript==
// @name         PickMe
// @namespace    http://tampermonkey.net/
// @version      1.8.1
// @description  Outils pour les membres du discord AVFR
// @author       Code : MegaMan, testeur : Ashemka (avec également du code de lelouch_di_britannia, FMaz008 et Thorvarium)
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
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_listValues
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

/*
NOTES:
* Votre clef API est lié à votre compte Discord
*/

(function() {
    'use strict';

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

    function createButton(asin) {
        var affiliateButton = document.createElement('a');

        affiliateButton.className = 'a-button a-button-primary a-button-small';
        affiliateButton.id = 'pickme-button';
        affiliateButton.style.marginTop = '5px'; // Pour ajouter un peu d'espace au-dessus du bouton
        affiliateButton.style.marginBottom = '5px';
        affiliateButton.style.color = 'white'; // Changez la couleur du texte en noir
        affiliateButton.style.maxWidth = '200px';
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
        } else {
            affiliateButton.href = `https://pickme.alwaysdata.net/monsieurconso/index.php?asin=${asin}`;
            affiliateButton.innerText = 'Acheter via PickMe';
            affiliateButton.target = '_blank';
        }
        return affiliateButton;
    }

    //Détermine si on ajoute l'onglet Notifications
    var pageProduit = false;
    var asinProduct = getASINfromURL(window.location.href);
    document.addEventListener('DOMContentLoaded', function() {
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
    });

    //Notif
    //On initialise les variables utiles pour cette partie du script
    let notifEnabled = GM_getValue("notifEnabled", false);
    let onMobile = GM_getValue("onMobile", false);
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
    GM_setValue("notifEnabled", notifEnabled);
    GM_setValue("onMobile", onMobile);
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

        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://pickme.alwaysdata.net/shyrka/infoasin",
                data: formData.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload: function(response) {
                    if (response && response.status == 200) {
                        try {
                            const data = JSON.parse(response.responseText);
                            const { date_last, title, linkText, linkUrl, main_image } = data;
                            const date_last_eu = convertToEuropeanDate(date_last);
                            resolve({ date_last_eu, title, linkText, linkUrl, main_image });
                        } catch (error) {
                            console.error("Erreur lors de l'analyse de la réponse JSON:", error);
                            reject(new Error("Erreur lors de l'analyse de la réponse JSON"));
                        }
                    } else if (response.status == 201) {
                        //console.log(response.status, response.responseText);
                        resolve(response.responseText);
                    } else {
                        // Gérer les réponses HTTP autres que le succès (ex. 404, 500, etc.)
                        console.error("Erreur HTTP:", response.status, response.statusText);
                        reject(new Error(`Erreur HTTP: ${response.status} ${response.statusText}`));
                    }
                },
                onerror: function(error) {
                    console.error("Erreur de requête:", error);
                    reject(error);
                }
            });
        });
    }

    //Afficher l'onglet "Favoris"
    function mesFavoris() {
        const MAX_FAVORIS = 200; // Limite des favoris affichés

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
        `;
            document.head.appendChild(style);

            // Fonction pour afficher les favoris
            async function afficherFavoris() {
                const favorisList = document.getElementById('favorisList');
                favorisList.innerHTML = ''; // Réinitialiser la liste des favoris

                const favoris = [];
                const promises = Object.keys(localStorage).map(async (key) => {
                    if (key.endsWith('_favori')) {
                        const favori = JSON.parse(localStorage.getItem(key));
                        if (favori.estFavori === true) {
                            const asin = key.split('_favori')[0]; // Extraire l'ASIN de la clé
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

                // Limiter les favoris à MAX_FAVORIS
                const favorisAffiches = favoris.slice(0, MAX_FAVORIS);

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

                // Ajouter des écouteurs d'événement pour les boutons de suppression
                document.querySelectorAll('.supprimerFavori').forEach(button => {
                    button.addEventListener('click', function() {
                        const key = this.getAttribute('data-key');
                        localStorage.removeItem(key);
                        const listItem = this.closest('tr');
                        if (listItem) {
                            listItem.remove(); // Supprimer la ligne correspondante
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
                        if (key.endsWith('_favori')) {
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

    // Fonction pour demander la permission et afficher la notification
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

    // Fonction pour afficher la notification sur PC
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

    //Affichage de l'onglet "Favoris"
    document.addEventListener("DOMContentLoaded", function() {
        if (window.location.href.startsWith('https://www.amazon.fr/vine/vine-items')) {
            mesFavoris();
        }
    });

    //Ecoute des messages entrants
    if (notifEnabled && apiKey) {
        var lastNotifId = null;
        if (notifFav) {
            var titleContentLower;
            if (filterOption == "notifFavOnly") {
                var favWordsTrimNotif = favWords.trim();
                var favArrayNotif = favWordsTrimNotif.length > 0 ? favWordsTrimNotif.split(',').map(mot => mot.toLowerCase().trim().replace(/\s+/g, '')).filter(mot => mot.length > 0) : [];

            } else if (filterOption == "notifExcludeHidden") {
                var hiddenWordsTrimNotif = hideWords.trim();
                var hiddenArrayNotif = hiddenWordsTrimNotif.length > 0 ? hiddenWordsTrimNotif.split(',').map(mot => mot.toLowerCase().trim().replace(/\s+/g, '')).filter(mot => mot.length > 0) : [];
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
                            if (favArrayNotif.length > 0 && favArrayNotif.some(mot => titleContentLower.includes(mot))) {
                                requestNotification(event.data.title, event.data.description, event.data.imageUrl, event.data.queue, event.data.page);
                            }
                        } else if (filterOption == "notifExcludeHidden") {
                            if (hiddenArrayNotif.length > 0 && !hiddenArrayNotif.some(mot => titleContentLower.includes(mot))) {
                                requestNotification(event.data.title, event.data.description, event.data.imageUrl, event.data.queue, event.data.page);
                            }
                        }
                    } else {
                        requestNotification(event.data.title, event.data.description, event.data.imageUrl, event.data.queue, event.data.page);
                    }
                }
            }
        });

        document.addEventListener("DOMContentLoaded", function() {
            if (window.location.hostname !== "pickme.alwaysdata.net") {
                // Initialisation de l'iframe seulement si on est sur le bon domaine
                var iframe = document.createElement('iframe');
                iframe.style.display = 'none'; // Rendre l'iframe invisible
                iframe.src = "https://pickme.alwaysdata.net/sw/websocket.php?key=" + encodeURIComponent(apiKey);
                document.body.appendChild(iframe);
            } else {
                document.cookie = "pm_apiKey=" + encodeURIComponent(apiKey) + "; path=/; secure";
            }
            if (!pageProduit && window.location.href.indexOf("vine") !== -1) {
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

                // Ajouter les nouveaux onglets au conteneur des onglets
                if (tabsContainer) {
                    tabsContainer.appendChild(newTab1);
                    tabsContainer.appendChild(newTab2);
                }
            }
        });
    }

    //Solution alternative pour le bouton d'achat PickMe, utile pour certains produits uniquement
    const pageTypeHints = ['/dp/', '/gp/product/'];
    const reviewPageHints = ['/product-reviews/'];
    const navElement = '.a-pagination';
    const idRegex = /\/(dp|gp\/product)\/.{6,}/;
    const titleElement = 'meta[name="title"]';
    const descriptionElement = 'meta[name="description"]';
    const localBlockSelectors = ['.cr-widget-FocalReviews', '#cm_cr-review_list'];
    const rBlockClass = '.a-section.review';
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
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://pickme.alwaysdata.net/shyrka/omh",
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        resolve(response);
                    },
                    onerror: function(error) {
                        reject(error);
                    }
                });
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
    //Solution alternative end

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

    document.addEventListener('DOMContentLoaded', function() {

        var version = GM_info.script.version;

        (GM_getValue("config")) ? GM_getValue("config") : GM_setValue("config", {}); // initialize the list of items that were posted to Discord

        //PickMe add
        // Initialiser ou lire la configuration existante
        let highlightEnabled = GM_getValue("highlightEnabled", true);
        let firsthlEnabled = GM_getValue("firsthlEnabled", true);
        let paginationEnabled = GM_getValue("paginationEnabled", true);

        let highlightColor = GM_getValue("highlightColor", "rgba(255, 255, 0, 0.5)");
        let highlightColorFav = GM_getValue("highlightColorFav", "rgba(255, 0, 0, 0.5)");
        let taxValue = GM_getValue("taxValue", true);
        let catEnabled = GM_getValue("catEnabled", true);
        let cssEnabled = GM_getValue("cssEnabled", false);
        let mobileEnabled = GM_getValue("mobileEnabled", false);
        let headerEnabled = GM_getValue("headerEnabled", false);
        let callUrlEnabled = GM_getValue("callUrlEnabled", false);

        let statsEnabled = GM_getValue("statsEnabled", false);
        let extendedEnabled = GM_getValue("extendedEnabled", false);
        let wheelfixEnabled = GM_getValue("wheelfixEnabled", true);
        let autohideEnabled = GM_getValue("autohideEnabled", false);
        let savedTheme = GM_getValue('selectedTheme', 'default');
        let savedButtonColor = GM_getValue('selectedButtonColor', 'default');
        let fastCmdEnabled = GM_getValue('fastCmdEnabled', false);
        let ordersEnabled = GM_getValue('ordersEnabled', true);
        let ordersStatsEnabled = GM_getValue('ordersStatsEnabled', false);
        let ordersInfos = GM_getValue('ordersInfos', false);

        // Enregistrement des autres valeurs de configuration
        GM_setValue("highlightEnabled", highlightEnabled);
        GM_setValue("firsthlEnabled", firsthlEnabled);
        GM_setValue("paginationEnabled", paginationEnabled);

        GM_setValue("highlightColor", highlightColor);
        GM_setValue("highlightColorFav", highlightColorFav);
        GM_setValue("taxValue", taxValue);
        GM_setValue("catEnabled", catEnabled);
        GM_setValue("cssEnabled", cssEnabled);
        GM_setValue("mobileEnabled", mobileEnabled);
        GM_setValue("headerEnabled", headerEnabled);
        GM_setValue("callUrlEnabled", callUrlEnabled);

        GM_setValue("statsEnabled", statsEnabled);
        GM_setValue("extendedEnabled", extendedEnabled);
        GM_setValue("wheelfixEnabled", wheelfixEnabled);
        GM_setValue("autohideEnabled", autohideEnabled);
        GM_setValue("selectedTheme", savedTheme);
        GM_setValue("selectedButtonColor", savedButtonColor);
        GM_setValue("fastCmdEnabled", fastCmdEnabled);
        GM_setValue("ordersEnabled", ordersEnabled);
        GM_setValue("ordersStatsEnabled", ordersStatsEnabled);
        GM_setValue("ordersInfos", ordersInfos);

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
                return new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: "https://pickme.alwaysdata.net/shyrka/webhookreco",
                        data: formData.toString(),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        },
                        onload: function(response) {
                            console.log(response.status, response.responseText);
                            resolve(response);
                        },
                        onerror: function(error) {
                            console.error(error);
                            reject(error);
                        }
                    });
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
            } else {
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
            // Extraire les composantes r, g, b de la couleur actuelle
            const rgbaMatch = highlightColor.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/);
            let hexColor = "#FFFF00"; // Fallback couleur jaune si la conversion échoue
            if (rgbaMatch) {
                const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
                const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
                const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
                hexColor = `#${r}${g}${b}`;
            }

            // Vérifie si une popup existe déjà et la supprime si c'est le cas
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
    `;
            popup.innerHTML = `
          <h2 id="configPopupHeader">Couleur de surbrillance des nouveaux produits<span id="closeColorPicker" style="float: right; cursor: pointer;">&times;</span></h2>
        <input type="color" id="colorPicker" value="${hexColor}" style="width: 100%;">
        <div class="button-container final-buttons">
            <button class="full-width" id="saveColor">Enregistrer</button>
            <button class="full-width" id="closeColor">Fermer</button>
        </div>
    `;

            document.body.appendChild(popup);

            // Ajoute des écouteurs d'événement pour les boutons
            document.getElementById('saveColor').addEventListener('click', function() {
                const selectedColor = document.getElementById('colorPicker').value;
                // Convertir la couleur hexadécimale en RGBA pour la transparence
                const r = parseInt(selectedColor.substr(1, 2), 16);
                const g = parseInt(selectedColor.substr(3, 2), 16);
                const b = parseInt(selectedColor.substr(5, 2), 16);
                const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.5)`;

                // Stocker la couleur sélectionnée
                GM_setValue("highlightColor", rgbaColor);
                highlightColor = rgbaColor;
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
            // Extraire les composantes r, g, b de la couleur actuelle
            const rgbaMatch = highlightColorFav.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/);
            let hexColor = "#FF0000"; // Fallback couleur jaune si la conversion échoue
            if (rgbaMatch) {
                const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
                const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
                const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
                hexColor = `#${r}${g}${b}`;
            }

            // Vérifie si une popup existe déjà et la supprime si c'est le cas
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

            // Ajoute des écouteurs d'événement pour les boutons
            document.getElementById('saveColor').addEventListener('click', function() {
                const selectedColor = document.getElementById('colorPicker').value;
                // Convertir la couleur hexadécimale en RGBA pour la transparence
                const r = parseInt(selectedColor.substr(1, 2), 16);
                const g = parseInt(selectedColor.substr(3, 2), 16);
                const b = parseInt(selectedColor.substr(5, 2), 16);
                const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.5)`;

                // Stocker la couleur sélectionnée
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

        // Définir des valeurs par défaut
        const defaultKeys = {
            left: 'q',
            right: 'd',
            up: 'z',
            down: 's',
            hide: 'h',
            show: 'j'
        };

        // Fonction pour récupérer la configuration des touches
        function getKeyConfig() {
            return {
                left: GM_getValue('keyLeft', defaultKeys.left),
                right: GM_getValue('keyRight', defaultKeys.right),
                up: GM_getValue('keyUp', defaultKeys.up),
                down: GM_getValue('keyDown', defaultKeys.down),
                hide: GM_getValue('keyHide', defaultKeys.hide),
                show: GM_getValue('keyShow', defaultKeys.show)
            };
        }

        // Fonction pour simuler un clic sur un bouton, identifié par son id
        function simulerClicSurBouton(idBouton) {
            // Pour les autres boutons, continue à simuler un clic réel
            const bouton = document.getElementById(idBouton);
            if (bouton) {
                bouton.click();
            }
        }

        // Écouteur d'événements pour la navigation des pages
        document.addEventListener('keydown', function(e) {
            const activeElement = document.activeElement; // Obtient l'élément actuellement en focus
            const searchBox = document.getElementById('twotabsearchtextbox'); // L'élément du champ de recherche d'Amazon

            // Vérifie si l'élément en focus est le champ de recherche
            if (activeElement === searchBox) {
                return; // Ignore le reste du code si le champ de recherche est en focus
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
            // Extraire le numéro de page actuel de l'URL
            const url = new URL(window.location);
            const params = url.searchParams;
            let page = parseInt(params.get('page') || '1', 10);

            // Calculer la nouvelle page
            page += direction;

            // S'assurer que la page est au minimum à 1
            if (page < 1) page = 1;

            // Mettre à jour le paramètre de page dans l'URL
            params.set('page', page);
            url.search = params.toString();

            // Naviguer vers la nouvelle page
            window.location.href = url.toString();
        }

        // Fonction pour calculer et formater le temps écoulé
        function formaterTempsEcoule(date) {
            const maintenant = new Date();
            const tempsEcoule = maintenant - new Date(date);
            const secondes = tempsEcoule / 1000;
            const minutes = secondes / 60;
            const heures = minutes / 60;
            const jours = heures / 24;

            // Si moins d'une minute s'est écoulée
            if (secondes < 60) {
                return Math.round(secondes) + 's';
            }
            // Si moins d'une heure s'est écoulée
            else if (minutes < 60) {
                return Math.round(minutes) + 'm';
            }
            // Si moins d'un jour s'est écoulé
            else if (heures < 24) {
                // Convertir les décimales des heures en minutes arrondies
                const heuresArrondies = Math.floor(heures);
                const minutesRestantes = Math.round((heures - heuresArrondies) * 60);
                return heuresArrondies + 'h ' + minutesRestantes + 'm';
            }
            // Si un ou plusieurs jours se sont écoulés
            else {
                // Convertir les décimales des jours en heures arrondies
                const joursArrondis = Math.floor(jours);
                const heuresRestantes = Math.round((jours - joursArrondis) * 24);
                return joursArrondis + 'j ' + heuresRestantes + 'h';
            }
        }

        // Fonction pour ajouter l'étiquette de temps à chaque produit
        function ajouterEtiquetteTemps() {
            const produits = document.querySelectorAll('.vvp-item-tile');

            produits.forEach(produit => {
                const asin = produit.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                const storedProducts = JSON.parse(GM_getValue("storedProducts", '{}'));

                if (storedProducts.hasOwnProperty(asin)) {
                    const dateAjout = storedProducts[asin].dateAdded;
                    const texteTempsEcoule = formaterTempsEcoule(dateAjout);

                    // Créer l'étiquette de temps
                    const etiquetteTemps = document.createElement('div');
                    etiquetteTemps.style.position = 'absolute';
                    etiquetteTemps.style.top = '5px';
                    etiquetteTemps.style.left = '5px'; // Position à gauche
                    etiquetteTemps.style.backgroundColor = 'rgba(255,255,255,0.7)';
                    etiquetteTemps.style.color = 'black';
                    etiquetteTemps.style.padding = '1px 2px';
                    etiquetteTemps.style.borderRadius = '5px';
                    etiquetteTemps.style.fontSize = '12px';
                    etiquetteTemps.style.whiteSpace = 'nowrap'; // Empêche le texte de passer à la ligne
                    etiquetteTemps.textContent = texteTempsEcoule;

                    // Ajouter l'étiquette de temps à l'image du produit
                    produit.querySelector('.vvp-item-tile-content').style.position = 'relative';
                    produit.querySelector('.vvp-item-tile-content').appendChild(etiquetteTemps);

                    // Ajuster la largeur du bandeau à celle du texte
                    etiquetteTemps.style.width = 'auto';
                }
            });
        }

        if (autohideEnabled && apiOk) {
            function tryAutoHide() {
                // Nettoie les chaînes et vérifie si elles sont vides
                var favWordsTrim = favWords.trim();
                var hideWordsTrim = hideWords.trim();

                const favArray = favWordsTrim.length > 0 ? favWordsTrim.split(',').map(mot => mot.toLowerCase().trim().replace(/\s+/g, '')).filter(mot => mot.length > 0) : [];
                const hideArray = hideWordsTrim.length > 0 ? hideWordsTrim.split(',').map(mot => mot.toLowerCase().trim().replace(/\s+/g, '')).filter(mot => mot.length > 0) : [];
                const itemTiles = document.querySelectorAll('.vvp-item-tile');

                if (itemTiles.length > 0) {
                    itemTiles.forEach(function(tile) {
                        const fullTextElement = tile.querySelector('.a-truncate-full.a-offscreen');
                        const parentDiv = tile.closest('.vvp-item-tile');
                        if (fullTextElement) {
                            const textContentLower = fullTextElement.textContent.toLowerCase().trim().replace(/\s+/g, '');

                            // Effectue la vérification seulement si favArray n'est pas vide
                            if (favArray.length > 0 && favArray.some(mot => textContentLower.includes(mot))) {
                                parentDiv.style.backgroundColor = highlightColorFav; // Assurez-vous que 'highlightColorFav' est bien défini
                                parentDiv.parentNode.prepend(parentDiv);
                            }
                            // Effectue la vérification seulement si hideArray n'est pas vide
                            else if (hideArray.length > 0 && hideArray.some(mot => textContentLower.includes(mot))) {
                                const asin = parentDiv.getAttribute('data-asin') || parentDiv.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                                const etatCacheKey = asin + '_cache';
                                localStorage.setItem(etatCacheKey, JSON.stringify({ estCache: false }));
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

        function ajouterIconeEtFonctionCacher() {
            const produits = document.querySelectorAll('.vvp-item-tile');
            const resultats = document.querySelector('#vvp-items-grid-container > p'); // Modifiez ce sélecteur si nécessaire

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
            const boutonVisibles = document.createElement('button');
            boutonVisibles.textContent = produitsVisibles;
            boutonVisibles.classList.add('bouton-filtre', 'active'); // Ajout des classes pour le style

            const boutonCaches = document.createElement('button');
            boutonCaches.textContent = produitsCaches;
            boutonCaches.classList.add('bouton-filtre'); // Ajout des classes pour le style

            // Ajout des boutons pour cacher tout et tout afficher
            const boutonCacherTout = document.createElement('button');
            boutonCacherTout.textContent = toutCacher;
            boutonCacherTout.classList.add('bouton-action');
            boutonCacherTout.id = 'boutonCacherTout';

            const boutonToutAfficher = document.createElement('button');
            boutonToutAfficher.textContent = toutAfficher;
            boutonToutAfficher.classList.add('bouton-action');
            boutonToutAfficher.id = 'boutonToutAfficher';

            const divBoutons = document.createElement('div');
            divBoutons.style.marginTop = '5px'; // Réduit l'espace au-dessus des boutons
            divBoutons.style.marginBottom = '15px'; // Augmente l'espace en dessous des boutons
            divBoutons.appendChild(boutonVisibles);
            divBoutons.appendChild(boutonCaches);
            divBoutons.appendChild(boutonCacherTout);
            divBoutons.appendChild(boutonToutAfficher);

            // Insertion des boutons après les résultats
            if (resultats) {
                resultats.after(divBoutons);
            }

            boutonVisibles.addEventListener('click', () => afficherProduits(true));
            boutonCaches.addEventListener('click', () => afficherProduits(false));

            // Fonction pour cacher ou afficher tous les produits
            function toggleTousLesProduits(cacher) {
                produits.forEach(produit => {
                    const asin = produit.getAttribute('data-asin') || produit.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                    const etatCacheKey = asin + '_cache';
                    const etatFavoriKey = asin + '_favori';

                    // Vérifie si le produit est en favori avant de changer son état de caché
                    const etatFavori = JSON.parse(localStorage.getItem(etatFavoriKey)) || { estFavori: false };
                    if (!etatFavori.estFavori) { // Ne modifie l'état de caché que si le produit n'est pas en favori
                        localStorage.setItem(etatCacheKey, JSON.stringify({ estCache: cacher }));

                        // Sélection de l'icône d'œil dans le produit actuel et mise à jour si l'état de caché change
                        const iconeOeil = produit.querySelector('img[src="' + urlIcone + '"], img[src="' + urlIconeOeil + '"]');
                        if (iconeOeil) {
                            iconeOeil.setAttribute('src', cacher ? urlIcone : urlIconeOeil);
                        }
                    }
                });

                // Force la mise à jour de l'affichage selon le nouveau statut de visibilité
                afficherProduits(!cacher);
            }
            // Gestion des clics sur les boutons Cacher tout et Tout afficher
            boutonCacherTout.addEventListener('click', () => toggleTousLesProduits(false));
            boutonToutAfficher.addEventListener('click', () => toggleTousLesProduits(true));

            // Affiche les produits en fonction du filtre : visible ou caché
            function afficherProduits(afficherVisibles) {
                const produitsFavoris = [];
                produits.forEach(produit => {
                    const asin = produit.getAttribute('data-asin') || produit.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                    const etatCacheKey = asin + '_cache';
                    const etatFavoriKey = asin + '_favori';

                    // Initialisation des états si non définis
                    let etatCache = JSON.parse(localStorage.getItem(etatCacheKey)) || { estCache: true };
                    let etatFavori = JSON.parse(localStorage.getItem(etatFavoriKey)) || { estFavori: false };

                    // Enregistre les valeurs par défaut si nécessaire
                    if (localStorage.getItem(etatCacheKey) === null) {
                        localStorage.setItem(etatCacheKey, JSON.stringify(etatCache));
                    }
                    if (localStorage.getItem(etatFavoriKey) === null) {
                        localStorage.setItem(etatFavoriKey, JSON.stringify(etatFavori));
                    }
                    //On test s'il est favori et si on peut le cacher ou non
                    if (etatFavori.estFavori) {
                        // Les produits favoris sont toujours affichés dans l'onglet "Produits visibles"
                        // et cachés dans l'onglet "Produits cachés"
                        produit.style.display = afficherVisibles ? '' : 'none';
                        produitsFavoris.push(produit);
                    } else {
                        if ((etatCache.estCache && afficherVisibles) || (!etatCache.estCache && !afficherVisibles)) {
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
                boutonVisibles.classList.toggle('active', afficherVisibles); // Active ou désactive le bouton des produits visibles
                boutonCaches.classList.toggle('active', !afficherVisibles); // Active ou désactive le bouton des produits cachés
                // Gestion de l'affichage des boutons "Cacher tout" et "Tout afficher"
                boutonCacherTout.style.display = afficherVisibles ? '' : 'none';
                boutonToutAfficher.style.display = !afficherVisibles ? '' : 'none';
            }

            produits.forEach(produit => {
                const asin = produit.getAttribute('data-asin') || produit.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                const etatCacheKey = asin + '_cache';
                const etatFavoriKey = asin + '_favori';
                const iconeOeil = document.createElement('img');

                const etatCache = JSON.parse(localStorage.getItem(etatCacheKey)) || { estCache: true };
                iconeOeil.setAttribute('src', etatCache.estCache ? urlIcone : urlIconeOeil);
                if (cssEnabled || mobileEnabled) {
                    iconeOeil.style.cssText = 'position: absolute; top: 0px; right: 1px; cursor: pointer; width: 35px; height: 35px; z-index: 10;';
                } else {
                    iconeOeil.style.cssText = 'position: absolute; top: 0px; right: 5px; cursor: pointer; width: 35px; height: 35px; z-index: 10;';
                }

                iconeOeil.addEventListener('click', () => {
                    const etatFavoriKey = asin + '_favori';
                    const etatFavori = JSON.parse(localStorage.getItem(etatFavoriKey)) || { estFavori: false };

                    // Vérifie si le produit n'est pas marqué comme favori avant de changer son état de caché
                    if (!etatFavori.estFavori) {
                        const etatCacheActuel = JSON.parse(localStorage.getItem(etatCacheKey)) || { estCache: false };
                        etatCacheActuel.estCache = !etatCacheActuel.estCache;
                        localStorage.setItem(etatCacheKey, JSON.stringify(etatCacheActuel));

                        // Met à jour l'icône basée sur le nouvel état après le clic
                        iconeOeil.setAttribute('src', etatCacheActuel.estCache ? urlIcone : urlIconeOeil);
                    }

                    // Force la mise à jour de l'affichage selon l'état actuel des filtres
                    afficherProduits(!boutonCaches.classList.contains('active'));
                });

                const urlIconeFavoriGris = 'https://pickme.alwaysdata.net/img/coeurgris2.png';
                const urlIconeFavoriRouge = 'https://pickme.alwaysdata.net/img/coeurrouge2.png';
                const iconeFavori = document.createElement('img');

                const etatFavori = JSON.parse(localStorage.getItem(etatFavoriKey));
                iconeFavori.setAttribute('src', etatFavori && etatFavori.estFavori ? urlIconeFavoriRouge : urlIconeFavoriGris);
                //On test si on utilise le css alternatif pour bouger l'emplacement du coeur, sinon il est superposé au temps du produit
                if (cssEnabled || mobileEnabled) {
                    //On test si le produit est nouveau
                    if (!storedProducts.hasOwnProperty(asin) || !highlightEnabled) {
                        iconeFavori.style.cssText = 'position: absolute; top: 8px; left: 4px; cursor: pointer; width: 23px; height: 23px; z-index: 10;';
                    } else {
                        iconeFavori.style.cssText = 'position: absolute; top: 30px; left: 4px; cursor: pointer; width: 23px; height: 23px; z-index: 10;';
                    }
                } else {
                    iconeFavori.style.cssText = 'position: absolute; top: 8px; left: 8px; cursor: pointer; width: 23px; height: 23px; z-index: 10;';
                }

                // Gestion du clic sur l'icône de favori
                iconeFavori.addEventListener('click', () => {
                    const etatFavoriActuel = JSON.parse(localStorage.getItem(etatFavoriKey)) || { estFavori: false };
                    etatFavoriActuel.estFavori = !etatFavoriActuel.estFavori;
                    localStorage.setItem(etatFavoriKey, JSON.stringify(etatFavoriActuel));
                    iconeFavori.setAttribute('src', etatFavoriActuel.estFavori ? urlIconeFavoriRouge : urlIconeFavoriGris);

                    if (etatFavoriActuel.estFavori) {
                        // Si le produit est marqué comme favori, s'assurer qu'il est marqué comme non caché
                        localStorage.setItem(etatCacheKey, JSON.stringify({ estCache: true }));
                        produit.style.display = ''; // Assure que le produit est visible
                        // Mettre à jour l'icône de l'œil pour refléter que le produit n'est plus caché
                        const iconeOeil = produit.querySelector('img[src="' + urlIcone + '"], img[src="' + urlIconeOeil + '"]');
                        if (iconeOeil) {
                            iconeOeil.setAttribute('src', urlIcone);
                        }
                    }

                    afficherProduits(!boutonCaches.classList.contains('active'));
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
#a-popover-6 {
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
            // Ajoutez la balise <style> au <head> de la page
            document.head.appendChild(style);
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

            mobileCss.textContent = `

#configPopup {
  width: 400px !important;
  height: 600px;
}

#colorPickerPopup, #keyConfigPopup, #favConfigPopup, #notifConfigPopup {
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

#favConfigPopup {
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
  #colorPickerPopup, #keyConfigPopup, #favConfigPopup, #notifConfigPopup {
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
  height: var(--max-product-title) !important;
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
        const urlParams = new URLSearchParams(window.location.search);
        const productsCont = document.querySelectorAll('.vvp-item-product-title-container > a.a-link-normal');
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
        const listElements = [];

        //Variable pour savoir s'il y a eu un nouvel objet
        let imgNew = false;
        let elementsToPrepend = [];
        productsCont.forEach(element => {
            const urlComp = element.href;
            listElements.push(urlComp);
            if ((firsthlEnabled || highlightEnabled) && apiOk) {
                const asin = element.href.split('/dp/')[1].split('/')[0]; // Extrait l'ASIN du produit
                const parentDiv = element.closest('.vvp-item-tile'); // Trouver le div parent à mettre en surbrillance
                //const containerDiv = document.getElementById('vvp-items-grid'); // L'élément conteneur de tous les produits
                // Vérifier si le produit existe déjà dans les données locales
                if (!storedProducts.hasOwnProperty(asin)) {
                    // Si le produit n'existe pas, l'ajouter aux données locales avec la date courante
                    const currentDate = new Date().toISOString(); // Obtenir la date courante en format ISO
                    storedProducts[asin] = {
                        added: true, // Marquer le produit comme ajouté
                        dateAdded: currentDate // Stocker la date d'ajout
                    };

                    GM_setValue("storedProducts", JSON.stringify(storedProducts)); // Sauvegarder les changements

                    // Appliquer la mise en surbrillance au div parent
                    if (parentDiv && highlightEnabled) {
                        parentDiv.style.backgroundColor = highlightColor;
                        imgNew = true;
                    }
                    // On stocke les produits qu'on va devoir remonter
                    if (parentDiv && firsthlEnabled) {
                        //containerDiv.prepend(parentDiv);
                        elementsToPrepend.push(parentDiv);
                        imgNew = true;
                    }
                }
            }
        });

        //On remonte les produits dans leur ordre initial
        if (firsthlEnabled && apiOk) {
            const containerDiv = document.getElementById('vvp-items-grid'); // L'élément conteneur de tous les produits
            if (containerDiv) {
                elementsToPrepend.reverse().forEach(element => {
                    containerDiv.prepend(element);
                });
            }
        }

        if (imgNew && callUrlEnabled && apiOk && callUrl && valeurQueue == "potluck") {
            appelURL();
        }
        if (listElements.length > 0) {
            sendDatasToAPI(listElements);
            if (ordersInfos && window.location.href.startsWith("https://www.amazon.fr/vine/vine-items?queue=")) {
                ordersPost(listElements);
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
            // Fonction pour extraire le nombre d'éléments par catégorie
            const extraireNombres = () => {
                const categories = document.querySelectorAll('.parent-node');
                const resultats = {};
                categories.forEach(cat => {
                    const nom = cat.querySelector('a').textContent.trim();
                    const nombre = parseInt(cat.querySelector('span').textContent.trim().replace(/[()]/g, ''), 10);
                    resultats[nom] = nombre;
                });
                return resultats;
            };

            const extraireNombreTotal = () => {
                const texteTotal = document.querySelector('#vvp-items-grid-container > p').textContent.trim();
                const nombreTotal = parseInt(texteTotal.match(/sur (\d+[\s\u00A0\u202F\u2009]*\d*)/)[1].replace(/[\s\u00A0\u202F\u2009]/g, ''), 10);
                return nombreTotal;
            };

            // Comparer le nombre total actuel avec celui stocké et mettre à jour l'affichage
            const comparerEtAfficherTotal = (nouveauTotal) => {
                const ancienTotal = parseInt(localStorage.getItem('nombreTotalRésultats') || '0', 10);
                const differenceTotal = nouveauTotal - ancienTotal;
                if (differenceTotal !== 0 && firstLoad) {
                    const containerTotal = document.querySelector('#vvp-items-grid-container > p');
                    const spanTotal = document.createElement('span');
                    spanTotal.textContent = ` (${differenceTotal > 0 ? '+' : ''}${differenceTotal})`;
                    spanTotal.style.color = differenceTotal > 0 ? 'green' : 'red';
                    containerTotal.appendChild(spanTotal);
                }
                if (imgNew && window.location.href.includes("queue=encore")) {
                    localStorage.setItem('nombreTotalRésultats', JSON.stringify(nouveauTotal));
                }
            }

            // Comparer les nombres actuels avec ceux stockés et mettre à jour l'affichage
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

                // Mise à jour du stockage local avec les nouveaux nombres si on a vu un nouvel objet uniquement
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

        // The modals related to error messages
        const errorMessages = document.querySelectorAll('#vvp-product-details-error-alert, #vvp-out-of-inventory-error-alert');

        //PickMe add
        function purgeStoredProducts(purgeAll = false) {
            // Charger les produits stockés ou initialiser comme un objet vide si aucun produit n'est trouvé
            var storedProducts = JSON.parse(GM_getValue("storedProducts", '{}'));
            const currentDate = new Date().getTime(); // Obtenir la date et l'heure courantes en millisecondes

            // Parcourir les clés (ASIN) dans storedProducts
            for (const asin in storedProducts) {
                if (storedProducts.hasOwnProperty(asin)) { // Vérification pour éviter les propriétés héritées
                    const cacheKey = asin + '_cache';
                    const favoriKey = asin + '_favori';
                    if (purgeAll) {
                        // Purger le produit sans vérifier la date
                        delete storedProducts[asin];
                    } else {
                        // Purger le produit en fonction de la date d'expiration
                        const productDateAdded = new Date(storedProducts[asin].dateAdded).getTime(); // Convertir la date d'ajout en millisecondes
                        if (currentDate - productDateAdded >= ITEM_EXPIRY) { // Vérifier si le produit a expiré
                            delete storedProducts[asin]; // Supprimer le produit expiré
                            localStorage.removeItem(cacheKey);
                            localStorage.removeItem(favoriKey);
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
                const isCacheKey = key.includes('_cache');
                const isFavoriKey = key.includes('_favori');
                if (isCacheKey || isFavoriKey) {
                    if (isCacheKey && purgeHidden) {
                        localStorage.removeItem(key);
                    } else if (isFavoriKey && purgeFavorites) {
                        localStorage.removeItem(key);
                    }
                }
            }
        }

        //On purge les anciens produits
        purgeStoredProducts();

        // On affiche les pages en haut si l'option est activée
        if (paginationEnabled && apiOk) {
            // Sélection du contenu HTML du div source
            const sourceElement = document.querySelector('.a-text-center');
            // Vérifier si l'élément source existe
            if (sourceElement) {
                // Maintenant que l'élément source a été mis à jour, copier son contenu HTML
                const sourceContent = sourceElement.outerHTML;

                // Création d'un nouveau div pour le contenu copié
                const newDiv = document.createElement('div');
                newDiv.innerHTML = sourceContent;
                newDiv.style.textAlign = 'center'; // Centrer le contenu
                newDiv.style.paddingBottom = '10px'; // Ajouter un petit espace après

                // Sélection du div cible où le contenu sera affiché
                const targetDiv = document.getElementById('vvp-items-grid-container');

                // S'assurer que le div cible existe avant d'insérer le nouveau div
                if (targetDiv) {
                    // Insertion du nouveau div au début du div cible
                    targetDiv.insertBefore(newDiv, targetDiv.firstChild);
                }
                // Trouver ou créer le conteneur de pagination si nécessaire
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
                    gotoButtonUp.className = 'a-last'; // Utiliser la même classe que le bouton "Suivant" pour le style
                    gotoButtonUp.innerHTML = `<a id="goToPageButton">${pageX}<span class="a-letter-space"></span><span class="a-letter-space"></span></a>`;

                    // Ajouter un événement click au bouton "Aller à"
                    gotoButtonUp.querySelector('a').addEventListener('click', function() {
                        askPage();
                    });

                    // Création du bouton "Aller à la page X"
                    const gotoButton = document.createElement('li');
                    gotoButton.className = 'a-last'; // Utiliser la même classe que le bouton "Suivant" pour le style
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
#configPopup, #keyConfigPopup, #favConfigPopup, #colorPickerPopup, #notifConfigPopup {
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

#keyConfigPopup h2, #favConfigPopup h2, #colorPickerPopup h2, #notifConfigPopup h2 {
  font-size: 1.5em;
  text-align: center;
}

#configPopup label, #keyConfigPopup label, #favConfigPopup label, #notifConfigPopup label {
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

#configPopup button, #keyConfigPopup button, #favConfigPopup button, #notifConfigPopup button {
  padding: 5px 10px;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

#configPopup button:not(.full-width), #keyConfigPopup button:not(.full-width), #favConfigPopup button:not(.full-width), #colorPickerPopup button:not(.full-width), #notifConfigPopup button:not(.full-width) {
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
#saveConfig, #closeConfig, #saveKeyConfig, #closeKeyConfig, #saveFavConfig, #closeFavConfig, #saveColor, #closeColor, #saveNotifConfig, #closeNotifConfig {
  padding: 8px 15px !important; /* Plus de padding pour un meilleur visuel */
  margin-top !important: 5px;
  border-radius: 5px !important; /* Bordures légèrement arrondies */
  font-weight: bold !important; /* Texte en gras */
  border: none !important; /* Supprime la bordure par défaut */
  color: white !important; /* Texte en blanc */
  cursor: pointer !important;
  transition: background-color 0.3s ease !important; /* Transition pour l'effet au survol */
}

#saveConfig, #saveKeyConfig, #saveFavConfig, #saveColor, #saveNotifConfig {
  background-color: #4CAF50 !important; /* Vert pour le bouton "Enregistrer" */
}

#closeConfig, #closeKeyConfig, #closeFavConfig, #closeColor, #closeNotifConfig {
  background-color: #f44336 !important; /* Rouge pour le bouton "Fermer" */
}

#saveConfig:hover, #saveKeyConfig:hover, #saveFavConfig:hover, #saveColor:hover, #saveNotifConfig:hover {
  background-color: #45a049 !important; /* Assombrit le vert au survol */
}

#closeConfig:hover, #closeKeyConfig:hover, #closeFavConfig:hover, #closeColor:hover, #closeNotifConfig:hover {
  background-color: #e53935 !important; /* Assombrit le rouge au survol */
}
#saveKeyConfig, #closeKeyConfig, #saveFavConfig, #closeFavConfig, #saveColor, #closeColor, #saveNotifConfig, #closeNotifConfig {
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

        // Crée la fenêtre popup de configuration avec la fonction de déplacement
        async function createConfigPopup() {
            if (document.getElementById('configPopup')) {
                return; // Termine la fonction pour éviter de créer une nouvelle popup
            }
            let isPremiumPlus = false;
            let isPremium = false;
            let dateLastSave = false;
            const responsePremiumPlus = await verifyTokenPremiumPlus(API_TOKEN);
            const responsePremium = await verifyTokenPremium(API_TOKEN);
            let apiToken = "";
            if (API_TOKEN == undefined) {
                apiToken = "";
            } else {
                isPremiumPlus = responsePremiumPlus && responsePremiumPlus.status === 200;
                isPremium = responsePremium && responsePremium.status === 200;
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
`;
            document.head.appendChild(style);
            const popup = document.createElement('div');
            popup.id = "configPopup";
            popup.innerHTML = `
    <h2 id="configPopupHeader">Paramètres PickMe v${version}<span id="closePopup" style="float: right; cursor: pointer;">&times;</span></h2>
    <div class="checkbox-container">
      ${createCheckbox('highlightEnabled', 'Surbrillance des nouveaux produits', 'Permet d\'ajouter un fond de couleur dès qu\'un nouveau produit est trouvé sur la page en cours. La couleur peut se choisir avec le bouton plus bas dans ces options.')}
      ${createCheckbox('firsthlEnabled', 'Mettre les nouveaux produits en début de page', 'Les nouveaux produits seront mis au tout début de la liste des produits sur la page en cours')}
      ${createCheckbox('paginationEnabled', 'Affichage des pages en partie haute', 'En plus des pages de navigation en partie basse, ajoute également la navigation des pages en début de liste des produits')}
      ${createCheckbox('hideEnabled', 'Pouvoir cacher des produits et ajouter des favoris', 'Ajoute l\'option qui permet de cacher certains produits de votre choix ainsi que des favoris (le produit devient impossible à cacher et sera toujours mis en tête en liste sur la page), ainsi que les boutons pour tout cacher ou tout afficher en une seule fois')}
      ${createCheckbox('catEnabled', 'Différence de quantité dans les catégories', 'Afficher à côté de chaque catégorie du bandeau à gauche la différence de quantité positive ou négative par rapport à la dernière fois où vous avez vu un nouveau produit. Se réinitialise à chaque fois que vous voyez un nouveau produit ou quand vous appuyez sur le bouton "Reset"')}
      ${createCheckbox('taxValue', 'Remonter l\'affichage de la valeur fiscale estimée', 'Dans la fênetre du produit qui s\'affiche quand on clique sur "Voir les détails", remonte dans le titre la valeur fiscale du produit au lieu qu\'elle soit en fin de fenêtre')}
      ${createCheckbox('cssEnabled', 'Utiliser l\'affichage réduit', 'Affichage réduit, pour voir plus de produits en même temps, avec également réduction de la taille des catégories. Option utile sur mobile par exemple. Non compatible avec l\'affichage du nom complet des produits et l\'affichage mobile')}
      ${createCheckbox('mobileEnabled', 'Utiliser l\'affichage mobile', 'Optimise l\affichage sur mobile, pour éviter de mettre la "Version PC". Il est conseillé de cacher également l\'entête avec cette option. Non compatible avec l\'affichage du nom complet des produits et l\'affichage réduit')}
      ${createCheckbox('headerEnabled', 'Cacher totalement l\'entête de la page', 'Cache le haut de la page Amazon, celle avec la zone de recherche et les menus')}
      ${createCheckbox('extendedEnabled', 'Afficher le nom complet des produits', 'Affiche 4 lignes, si elles existent, au nom des produits au lieu de 2 en temps normal. Non compatible avec l\'affichage alternatif')}
      ${createCheckbox('wheelfixEnabled', 'Corriger le chargement infini des produits', 'Corrige le bug quand un produit ne charge pas (la petite roue qui tourne sans fin). Attention, même si le risque est très faible, on modifie une information transmise à Amazon, ce qui n\'est pas avec un risque de 0%')}
      ${createCheckbox('fullloadEnabled', 'N\'afficher la page qu\'après son chargement complet', 'Attend le chargement complet des modifications de PickMe avant d\'afficher la page. Cela peut donner la sensation d\'un chargement plus lent de la page mais évite de voir les produits cachés de façon succincte ou le logo Amazon par exemple')}
      ${createCheckbox('autohideEnabled', 'Cacher/Mettre en avant selon le nom du produit', 'Permet de cacher automatiquement des produits selon des mots clés, ou au contraire d\'en mettre en avant. Peut ajouter de la latence au chargement de la page, surtout si l\'option "N\'afficher la page qu\'après son chargement complet" est activée')}
      ${createCheckbox('ordersEnabled', 'Afficher code erreur/Envoyer mes commandes', 'Afficher un code erreur quand une commande ne passe pas. Attention, cela envoi également vos commandes sur le serveur pour le besoin de certaines fonctions')}
      ${createCheckbox('fastCmdEnabled', '(PC) Accélérer le processus de commandes', 'Met le focus sur le bouton pour commander (il suffira donc de faire "Entrée" pour valider) et agrandir la fenêtre contenant les adresses, ce qui alignera les boutons de validation des deux fenêtres si vous souhaitez cliquer')}
      ${createCheckbox('callUrlEnabled', '(Webhook) Appeler une URL lors de la découverte d\'un nouveau produit en recommandation', 'Appelle l\'URL choisie (bouton plus bas) lors de la découverte d\'un nouveau produit en reco. Cela peut être une API ou un MP3 (le fichier doit être donné sous la forme d\'un lien internet). Si c\'est un MP3, il sera également utilisé pour le son des notifications')}
      ${createCheckbox('notifEnabled', '(Premium) Activer les notifications', 'Affiche une notification lors du signalement d\'un nouvel objet "Disponible pour tous", un up ou autre selon la configuration. Ne fonctionne que si une page Amazon était active dans les dernières secondes ou si le centre de notifications est ouvert en Auto-refresh de moins de 30 secondes',!isPremium)}
      ${createCheckbox('ordersInfos', '(Premium) Afficher l\'ETV et les informations de la communauté sur les commandes','Affiche l\'ETV du produit (si disponible) ainsi que le nombre de personnes ayant pu commander ou non le produit (rond vert : commande réussie, rond rouge : commande en erreur)', !isPremium)}
      ${createCheckbox('statsEnabled', '(Premium+) Afficher les statistiques produits','Affiche la quantité de produits ajoutés ce jour et dans le mois à côté des catégories', !isPremiumPlus)}
      ${createCheckbox('ordersStatsEnabled', '(Premium+) Afficher le nombre de commandes du jour/mois','Affiche le nombre de commandes passées sur la journée et le mois en cours', !isPremiumPlus)}
    </div>
     <div class="api-token-container">
      <label for="apiTokenInput">Clef API :</label>
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
    ${addActionButtons(!isPremium, !isPremiumPlus, dateLastSave)}
  `;
            document.body.appendChild(popup);

            //Initialiser le thème et choisir celui qui est actif dans la liste
            document.getElementById('themeSelect').value = savedTheme;

            //Initialiser la couleur des boutons et choisir celle qui est active dans la liste
            document.getElementById('buttonColorSelect').value = savedButtonColor;

            document.getElementById('cssEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('extendedEnabled').checked = false;
                    document.getElementById('mobileEnabled').checked = false;
                }
            });

            document.getElementById('mobileEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('extendedEnabled').checked = false;
                    document.getElementById('cssEnabled').checked = false;
                    document.getElementById('fastCmdEnabled').checked = false;
                }
            });

            document.getElementById('extendedEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('cssEnabled').checked = false;
                    document.getElementById('mobileEnabled').checked = false;
                }
            });

            document.getElementById('fastCmdEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('mobileEnabled').checked = false;
                }
            });

            document.getElementById('notifEnabled').addEventListener('change', function() {
                if (this.checked) {
                    // Demander à l'utilisateur s'il est sur mobile ou PC
                    var onMobile = window.confirm("Êtes-vous sur un appareil mobile ?");

                    // Utilisation de GM pour set la variable
                    GM_setValue('onMobile', onMobile);
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
            document.getElementById('configurerTouches').addEventListener('click', configurerTouches);
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
                if (confirm("Êtes-vous sûr de vouloir restaurer la sauvegarde ?")) {
                    restoreData();
                }
            });
            document.getElementById('purgeStoredProducts').addEventListener('click', () => {
                if (confirm("Êtes-vous sûr de vouloir supprimer les produits enregistrés pour la surbrillance ?")) {
                    purgeStoredProducts(true);
                }
            });

            document.getElementById('purgeHiddenObjects').addEventListener('click', () => {
                purgeHiddenObjects(true);
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
                alert("Clef API invalide !");
                return
            }
            // Enregistrer le thème sélectionné
            const selectedTheme = document.getElementById('themeSelect').value;
            GM_setValue('selectedTheme', selectedTheme);

            // Enregistrer la couleur des boutons sélectionnée
            const selectedButtonColor = document.getElementById('buttonColorSelect').value;
            GM_setValue('selectedButtonColor', selectedButtonColor);
            //On recharge la page et on ferme le menu
            window.location.reload();
            document.getElementById('configPopup').remove();
        }

        // Ajoute les boutons pour les actions spécifiques qui ne sont pas juste des toggles on/off
        function addActionButtons(isPremium, isPremiumPlus, dateLastSave) {
            return `
<div class="button-container action-buttons">

  <button id="configurerFiltres">Configurer les mots pour le filtre</button>

  <button id="configurerTouches">Configurer les touches</button>
  <button id="setHighlightColor">Couleur de surbrillance des nouveaux produits</button>
  <button id="setHighlightColorFav">Couleur de surbrillance des produits filtrés</button>
  <button id="setUrl">(Webhook) Choisir l'URL</button>
  <button id="testUrl">(Webhook) Tester l'URL</button>
  <button id="configurerNotif" ${isPremium ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ''}>(Premium) Configurer les notifications</button>
  <button id="syncProducts" ${isPremium ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ''}>(Premium) Synchroniser les produits avec le serveur</button>
  <button id="saveData" ${isPremium ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ''}>(Premium) Sauvegarder les paramètres/produits</button>
  <button id="restoreData" ${isPremium ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ''}>(Premium) Restaurer les paramètres/produits${dateLastSave ? ' (' + dateLastSave + ')' : ''}</button>
  <button id="purgeStoredProducts">Supprimer les produits enregistrés pour la surbrillance</button>
  <button id="purgeHiddenObjects">Supprimer les produits cachés et/ou les favoris</button>
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
        function createKeyConfigPopup() {
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
        function createKeyInput(id, label) {
            const value = GM_getValue(id, ''); // Récupère la valeur actuelle ou une chaîne vide par défaut
            return `
        <div style="margin-top: 10px;">
            <label for="${id}" style="display: block;">${label}</label>
            <input type="text" id="${id}" name="${id}" value="${value}" style="width: 100%; box-sizing: border-box; padding: 8px; margin-top: 4px;">
        </div>
    `;
        }

        // Fonction pour enregistrer la configuration des touches
        function saveKeyConfig() {
            const keys = ['keyLeft', 'keyRight', 'keyUp', 'keyDown', 'keyHide', 'keyShow'];
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
    <h2>Configurer les Notifications<span id="closeNotifPopup" style="float: right; cursor: pointer;">&times;</span></h2>
    <div class="checkbox-container">
    <u class="full-width">Options :</u><br>
    ${createCheckbox('notifFav', 'Filtrer "Autres articles"', 'Utilise les filtres (soit celui des favoris, soit celui pour exclure) pour ne remonter que les notifications favoris ou sans mots exclus et uniquement si c\'est un produit "Autres articles" (aucun filtre sur "Disponibles pour tous"). La notification apparaitra tout de même dans le centre de notifications. Prend en compte le filtre, même si l\'option des filtres est désactivée')}
    ${createCheckbox('notifSound', 'Jouer un son', 'Permet de jouer un son à réception d\'une notification. Astuce : pour personnaliser le son, il est possible d\'utiliser l\'option expérimentale pour saisir l\'URL du mp3 (uniquement) de votre choix')}
    <select id="filterOptions" ${notifFav ? '' : 'disabled'} style="margin-bottom: 10px;">
       <option value="notifFavOnly" ${filterOption === 'notifFavOnly' ? 'selected' : ''}>Ne voir que les favoris</option>
       <option value="notifExcludeHidden" ${filterOption === 'notifExcludeHidden' ? 'selected' : ''}>Tout voir sauf mots exclus</option>
    </select>
    ${createCheckbox('onMobile', 'Version mobile')}
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
        function createFavConfigPopup() {
            // Vérifie si une popup existe déjà et la supprime si c'est le cas
            const existingPopup = document.getElementById('favConfigPopup');
            if (existingPopup) {
                existingPopup.remove();
            }

            // Crée la fenêtre popup
            const popup = document.createElement('div');
            popup.id = "favConfigPopup";
            popup.style.cssText = `
        z-index: 10001; /* Assure-toi que ce z-index est suffisamment élevé pour surpasser les autres éléments */
        width: 600px;
    `;
            popup.innerHTML = `
        <h2 id="configPopupHeader">Configuration des filtres<span id="closeFavPopup" style="float: right; cursor: pointer;">&times;</span></h2>
        <div>
            <label for="favWords">Produits favoris :</label>
            <textarea id="favWords" name="favWords" style="width: 100%; height: 70px;">${GM_getValue('favWords', '')}</textarea>
        </div>
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

        // Modification de la fonction configurerTouches pour ouvrir la popup
        function configurerTouches() {
            createKeyConfigPopup();
        }
        function configurerFiltres() {
            createFavConfigPopup();
        }
        function configurerNotif() {
            createNotifConfigPopup();
        }
        //End

        // Removes old products if they've been in stored for 90+ days
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

        // Comment gets truncated by its lists, since the lengths of those are unknown, and we'll just say how many more there are at the end
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
                    tooLong = false; // in the rare likelihood that this will loop forever
                }

                for (let x=0; x<arr.length; x++) {
                    var split = arr[x].split(' ● ');
                    var fullArrayLength = arr.join('').length;
                    if (split.length > 1 && !variantQuantities[x]) {
                        variantQuantities[x] = split.length;
                    }

                    if (split.length > 1 && fullArrayLength > MAX_COMMENT_LENGTH && compareItemLengths(x)) {
                        variantQuantities[x] = split.length - 1; // keep track of this index's array length
                        variantsRemoved[x] = (variantsRemoved.hasOwnProperty(x)) ? variantsRemoved[x]+1 : 1; // used for tracking the number of variants that were truncated
                        split.pop();
                        arr[x] = split.join(' ● ');
                        arr[x] += `** ... +${variantsRemoved[x]} more**`;
                    } else if (fullArrayLength <= MAX_COMMENT_LENGTH) {
                        break;
                    }
                }

                if (!(arr.join('\n').length > MAX_COMMENT_LENGTH)) {
                    // the string is finally short enough to be sent over the API
                    truncatedString = arr.join('\n');
                    tooLong = false;
                }
                count++;
            }

            return truncatedString.trim();
        }

        function verifyToken(token) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://pickme.alwaysdata.net/shyrka/user/${token}`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    onload: function(response) {
                        console.log(response.status, response.responseText);
                        resolve(response);
                    },
                    onerror: function(error) {
                        console.error(error);
                        reject(error);
                    },
                });
            });
        }

        function verifyTokenPremiumPlus(token) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://pickme.alwaysdata.net/shyrka/userpremiumplus/${token}`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    onload: function(response) {
                        console.log(response.status, response.responseText);
                        resolve(response);
                    },
                    onerror: function(error) {
                        console.error(error);
                        reject(error);
                    },
                });
            });
        }

        function verifyTokenPremium(token) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://pickme.alwaysdata.net/shyrka/userpremium/${token}`,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    onload: function(response) {
                        console.log(response.status, response.responseText);
                        resolve(response);
                    },
                    onerror: function(error) {
                        console.error(error);
                        reject(error);
                    },
                });
            });
        }

        async function askForToken(reason) {
            return new Promise(async (resolve, reject) => {
                var userInput = prompt(`Votre clef API est ${reason}. Merci d'entrer une clef API valide:`);

                if (userInput !== null) {
                    try {
                        var response = await verifyToken(userInput);
                        if (response && response.status === 200) {
                            // Save token after validation
                            GM_setValue('apiToken', userInput);
                            resolve(userInput);
                        } else if (response && response.status === 404) {
                            GM_deleteValue("apiToken");
                            alert("Clef API invalide !");
                            reject("Invalid API token");
                        } else {
                            GM_deleteValue("apiToken");
                            alert("Vérification de la clef échoué. Merci d'essayer plus tard.");
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

        // Checks if each dropdown has more than 1 option
        // Useful for pointing out misleading parent products
        function countVariations(obj) {
            for (const key in obj) {
                if (Array.isArray(obj[key]) && obj[key].length > 1) {
                    return false; // If there are multiple variations, then we're better off not alerting anyone
                }
            }
            return true;
        }

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
                comment = truncateString(comment); // Comment truncation, if necessary
            }

            comment = comment.join('\n');
            comment = comment?.replace("\n", "\n\n"); // A fix for the weird formatting issue where the 1st line break requires 2 newlines instead of 1

            return comment;
        }

        // Triggers when the Discord button is clicked
        async function buttonHandler() {

            // Prepping data to be sent to the API
            var productData = {};
            var childAsin = document.querySelector("a#vvp-product-details-modal--product-title").href.match(/amazon..+\/dp\/([A-Z0-9]+).*$/)[1];
            var childImage = document.querySelector('#vvp-product-details-img-container > img');
            var variations = returnVariations();
            productData.variations = (Object.keys(variations).length > 0) ? variations : null;
            productData.isLimited = (document.querySelector('#vvp-product-details-modal--limited-quantity').style.display !== 'none') ? true : false;
            productData.asin = parentAsin;
            productData.differentChild = (parentAsin !== childAsin) ? true : false; // comparing the asin loaded in the modal to the one on the webpage
            productData.differentImages = (parentImage !== childImage.src?.match(PRODUCT_IMAGE_ID)[1]) ? true : false;
            productData.etv = document.querySelector("#vvp-product-details-modal--tax-value-string")?.innerText.replace("€", "");
            productData.queue = queueType;
            productData.seller = document.querySelector("#vvp-product-details-modal--by-line").innerText.replace(/^par /, '');
            productData.comments = writeComment(productData);
            // possibly more things to come...

            const response = await sendDataToAPI(productData);

            var listOfItems = GM_getValue('config');

            if (response) {
                // deal with the API response
                if (response.status == 200) { // successfully posted to Discord
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

        // Update position of the button
        function updateButtonPosition() {
            const button = document.querySelector('.a-button-discord');
            const container = productDetailsModal;

            // check the size of the modal first before determining where the button goes
            if (container.offsetWidth < container.offsetHeight) {
                // the See Details modal is taller, so moving it toward the bottom
                button.classList.add('mobile-vertical');
                button.parentElement.appendChild(button);
            } else {
                // revert to the original button placement
                button.classList.remove('mobile-vertical');
                button.parentElement.prepend(button);
            }

            button.removeElement; // remove the old button
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
                discordBtn.innerHTML = `${btn_error}<span class="a-button-text">Clef API invalide</span>`;
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
                etv: data.etv,
                comment: data.comments,
            });
            //End
            updateButtonIcon(1);

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "PUT",
                    url: "https://pickme.alwaysdata.net/shyrka/product",
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    onload: function(response) {
                        console.log(response.status, response.responseText);
                        resolve(response);
                    },
                    onerror: function(error) {
                        console.error(error);
                        updateButtonIcon(6);
                        reject(error);
                    },
                });
            });

        }

        //PickMe add
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
                urls: JSON.stringify(data),
                queue: valeurQueue,
                page: valeurPage,
            });

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://pickme.alwaysdata.net/shyrka/products",
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        //console.log(response.status, response.responseText);
                        resolve(response);
                    },
                    onerror: function(error) {
                        //console.error(error);
                        reject(error);
                    }
                });
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
                    //On ajoute chaque asin à la liste pour appeler les infos de commandes
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
                        imageUrl : imageUrl,
                        title : productName,
                    });
                    return new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: "https://pickme.alwaysdata.net/shyrka/orderlist",
                            data: formData.toString(),
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            onload: function(response) {
                                if (response.status == 200) {
                                    //resolve(response.responseText);
                                } else {
                                    //reject(`Error: ${response.status} ${response.statusText}`);
                                }
                            },
                            onerror: function(error) {
                                console.error(error);
                                reject(error);
                            }
                        });
                    });
                });
                ordersPostCmd(listASINS);
            }
        }

        if (ordersEnabled) {
            saveOrders();
        }

        function ordersPost(data) {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
                urls: JSON.stringify(data),
                queue: valeurQueue,
            });

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://pickme.alwaysdata.net/shyrka/asinsinfo",
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        if (response.status == 200) {
                            const productsData = JSON.parse(response.responseText);
                            showOrders(productsData);
                            resolve(productsData);
                        } else {
                            reject(`Error: ${response.status} ${response.statusText}`);
                        }
                    },
                    onerror: function(error) {
                        //console.error(error);
                        reject(error);
                    }
                });
            });
        }

        function ordersPostCmd(data) {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
                urls: JSON.stringify(data),
            });

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://pickme.alwaysdata.net/shyrka/asinsinfocmd",
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        if (response.status == 200) {
                            const productsData = JSON.parse(response.responseText);
                            showOrdersCmd(productsData);
                            resolve(productsData);
                        } else {
                            reject(`Error: ${response.status} ${response.statusText}`);
                        }
                    },
                    onerror: function(error) {
                        //console.error(error);
                        reject(error);
                    }
                });
            });
        }

        //Pour afficher les commandes et l'etv
        function showOrders(data) {
            const items = document.querySelectorAll('.vvp-item-tile');
            if (items.length === 0) return;

            items.forEach(item => {
                const asin = item.getAttribute('data-asin') || item.querySelector('.vvp-details-btn input').getAttribute('data-asin');
                const url = "https://www.amazon.fr/dp/" + asin;
                const orderData = data.find(d => d.url === url);
                if (!orderData) return;

                item.style.position = 'relative';

                const iconSources = {
                    success: "https://pickme.alwaysdata.net/img/orderok.png",
                    error: "https://pickme.alwaysdata.net/img/ordererror.png"
                };

                const positions = mobileEnabled ? 'bottom: 50%;' : (cssEnabled ? 'bottom: 40%;' : 'bottom: 46%;');
                const iconSize = mobileEnabled || cssEnabled ? '21px' : '28px';
                const fontSize = mobileEnabled || cssEnabled ? '12px' : '14px';
                const sidePadding = mobileEnabled || cssEnabled ? '3px' : '8px';

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

        //Pour afficher les commandes et l'etv
        function showOrdersCmd(data) {
            const items = document.querySelectorAll('.vvp-orders-table--row');
            if (items.length === 0) return;

            items.forEach(item => {
                const imageElement = item.querySelector('.vvp-orders-table--image-col img');
                const productLink = item.querySelector('.vvp-orders-table--text-col a');
                if (!imageElement || !productLink) return;

                const url = productLink.href;
                const orderData = data.find(d => d.url === url);
                if (!orderData) return;

                const iconSources = {
                    success: "https://pickme.alwaysdata.net/img/orderok.png",
                    error: "https://pickme.alwaysdata.net/img/ordererror.png"
                };

                const positions = mobileEnabled ? 'bottom: 10%;' : 'bottom: 10%;';
                const iconSize = mobileEnabled ? '28px' : '28px';
                const fontSize = mobileEnabled ? '14px' : '14px';
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
            });
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
        function syncProducts() {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
            });

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://pickme.alwaysdata.net/shyrka/sync",
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 300) {
                            try {
                                // Tente de parser le texte de réponse en JSON
                                const productsData = JSON.parse(response.responseText);
                                syncProductsData(productsData);
                                //console.log(jsonResponse); // Affiche la réponse parsée dans la console
                                resolve(productsData);
                            } catch (error) {
                                console.error("Erreur lors du parsing JSON:", error);
                                reject(error);
                            }
                        } else if (response.status == 401) {
                            alert("Clef API invalide ou membre non Premium+");
                            console.log(response.status, response.responseText);
                            resolve(response);
                        } else {
                            // Gérer les réponses HTTP autres que le succès (ex. 404, 500, etc.)
                            console.error("Erreur HTTP:", response.status, response.statusText);
                            reject(new Error(`Erreur HTTP: ${response.status} ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        console.error("Erreur de requête:", error);
                        reject(error); // Rejette la promesse en cas d'erreur de requête
                    }
                });
            });
        }

        //Appel API pour la quantité de produits
        function qtyProducts() {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
            });

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://pickme.alwaysdata.net/shyrka/qtyproducts", // Assurez-vous que l'URL est correcte
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 300) {
                            try {
                                // Tente de parser le texte de réponse en JSON
                                const productsData = JSON.parse(response.responseText); // Parsez le JSON de la réponse
                                qtyProductsData(productsData); // Traitez les données
                                //console.log(jsonResponse); // Affiche la réponse parsée dans la console
                                resolve(productsData); // Résout la promesse avec l'objet JSON
                            } catch (error) {
                                console.error("Erreur lors du parsing JSON:", error);
                                reject(error); // Rejette la promesse si le parsing échoue
                            }
                        } else if (response.status == 401) {
                            //alert("Token invalide ou membre non Premium+");
                            console.log(response.status, response.responseText);
                            resolve(response);
                        } else {
                            // Gérer les réponses HTTP autres que le succès (ex. 404, 500, etc.)
                            console.error("Erreur HTTP:", response.status, response.statusText);
                            reject(new Error(`Erreur HTTP: ${response.status} ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        console.error("Erreur de requête:", error);
                        reject(error); // Rejette la promesse en cas d'erreur de requête
                    }
                });
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
        <p style="margin:0; font-weight: bold; text-decoration: underline;">Nouveaux produits :</p>
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

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://pickme.alwaysdata.net/shyrka/qtyorders", // Assurez-vous que l'URL est correcte
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 300) {
                            try {
                                // Tente de parser le texte de réponse en JSON
                                const ordersData = JSON.parse(response.responseText); // Parsez le JSON de la réponse
                                qtyOrdersData(ordersData); // Traitez les données
                                //console.log(jsonResponse); // Affiche la réponse parsée dans la console
                                resolve(ordersData); // Résout la promesse avec l'objet JSON
                            } catch (error) {
                                console.error("Erreur lors du parsing JSON:", error);
                                reject(error); // Rejette la promesse si le parsing échoue
                            }
                        } else if (response.status == 401) {
                            //alert("Token invalide ou membre non Premium+");
                            console.log(response.status, response.responseText);
                            resolve(response);
                        } else {
                            // Gérer les réponses HTTP autres que le succès (ex. 404, 500, etc.)
                            console.error("Erreur HTTP:", response.status, response.statusText);
                            reject(new Error(`Erreur HTTP: ${response.status} ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        console.error("Erreur de requête:", error);
                        reject(error); // Rejette la promesse en cas d'erreur de requête
                    }
                });
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
        <p style="margin:0;">Aujourd'hui : ${displayOrdersTodayWithSuffix}</p>
        <p style="margin:0; ${statsEnabled ? 'margin-bottom: 1em;' : ''}">Mois en cours : ${ordersData.qty_orders_month}</p>
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
        function syncProductsData(productsData) {
            let userHideAll = confirm("Voulez-vous également cacher tous les produits ? OK pour activer, Annuler pour désactiver.");
            // Assurez-vous que storedProducts est initialisé, récupérez-le ou initialisez-le comme un objet vide
            let storedProducts = JSON.parse(GM_getValue("storedProducts", "{}"));

            productsData.forEach(product => {
                const asin = product.asin; // L'ASIN est directement disponible depuis le JSON
                const currentDate = product.date_ajout;
                if (userHideAll) {
                    const etatFavoriKey = asin + '_favori';
                    const etatFavori = JSON.parse(localStorage.getItem(etatFavoriKey)) || { estFavori: false };
                    if (!etatFavori.estFavori) { // Ne modifie l'état de caché que si le produit n'est pas en favori
                        const etatCacheKey = asin + '_cache';
                        localStorage.setItem(etatCacheKey, JSON.stringify({ estCache: false }));
                    }
                }
                // Mettre à jour ou ajouter le produit dans storedProducts
                storedProducts[asin] = {
                    added: true, // Marquer le produit comme ajouté
                    dateAdded: currentDate // Utilisez la date d'ajout fournie par l'API si vous le souhaitez
                };
            });

            // Sauvegarder les changements dans storedProducts
            GM_setValue("storedProducts", JSON.stringify(storedProducts));
            alert("Les produits ont été synchronisés.");
            window.location.reload();
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

        let parentAsin, parentImage, queueType;

        // As much as I hate this, this adds event listeners to all of the "See details" buttons
        document.querySelectorAll('.a-button-primary.vvp-details-btn > .a-button-inner > input').forEach(function(element) {
            element.addEventListener('click', function() {

                parentAsin = this.getAttribute('data-asin');
                parentImage = this.parentElement.parentElement.parentElement.querySelector('img').src.match(PRODUCT_IMAGE_ID)[1];
                queueType = urlData?.[2] || d_queueType(this.getAttribute('data-recommendation-type'));

                // silencing console errors; a null error is inevitable with this arrangement; I might fix this in the future
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
                            cutTextElement.textContent = fullTextElement.textContent;
                            // Appliquez les styles directement pour surmonter les restrictions CSS
                            cutTextElement.style.cssText = 'height: auto !important; max-height: none !important; overflow: visible !important; white-space: normal !important;';
                        }
                    });
                } else {
                    setTimeout(tryExtended, 100);
                }


                // Appliquez des styles plus spécifiques pour surmonter les restrictions CSS
                document.querySelectorAll('.vvp-item-tile .a-truncate').forEach(function(element) {
                    element.style.cssText = 'max-height: 5.6em !important;';
                });
            }
            setTimeout(tryExtended, 600);
            //tryExtended();
        }

        //Wheel Fix
        if (apiOk) {
            if (wheelfixEnabled || ordersEnabled) {
                const origFetch = window.fetch;
                var lastParentVariant = null;
                var responseData = {};
                var postData = {};
                unsafeWindow.fetch = async (...args) => {
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
                                // Sélectionner tous les éléments avec la classe "a-alert-content"
                                var alertContents = document.querySelectorAll('.a-alert-content');

                                // Texte à ajouter en gras avec un retour à la ligne avant
                                var texteAAjouter = "<br><strong> (PickMe) Code erreur  : " + responseData.error + "</strong>";

                                // Parcourir tous les éléments sélectionnés
                                alertContents.forEach(function(alertContent) {
                                    // Ajouter le texte après le contenu actuel
                                    alertContent.innerHTML += texteAAjouter;
                                });
                            }

                            GM_xmlhttpRequest({
                                method: "POST",
                                url: "https://pickme.alwaysdata.net/shyrka/order",
                                data: formData.toString(),
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                },
                            });

                            //Wait 500ms following an order to allow for the order report query to go through before the redirect happens.
                            await new Promise((r) => setTimeout(r, 500));
                            return response;
                        }
                    }

                    regex = /^api\/recommendations\/.*$/;
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
                            // The item has an ETV value, let's find out if it's a child or a parent
                            const isChild = !!lastParent?.variations?.some((v) => v.asin == result.asin);
                            var asinData = result.asin;
                            //On test si le produit a des variantes, on récupère le parent pour notre base de données
                            if (isChild) {
                                regex = /^.+?#(.+?)#.+$/;
                                let arrMatchesP = lastParent.recommendationId.match(regex);
                                asinData = arrMatchesP[1];
                            }
                            var formDataETV = new URLSearchParams({
                                version: version,
                                token: API_TOKEN,
                                asin: asinData,
                                etv: result.taxValue,
                                queue: valeurQueue,
                            });
                            if (ordersEnabled) {
                                GM_xmlhttpRequest({
                                    method: "POST",
                                    url: "https://pickme.alwaysdata.net/shyrka/etv",
                                    data: formDataETV.toString(),
                                    headers: {
                                        "Content-Type": "application/x-www-form-urlencoded"
                                    },
                                });
                            }
                        }
                        if (wheelfixEnabled) {
                            let fixed = 0;
                            result.variations = result.variations?.map((variation) => {
                                if (Object.keys(variation.dimensions || {}).length === 0) {
                                    variation.dimensions = {
                                        asin_no: variation.asin,
                                    };
                                    fixed++;
                                    return variation;
                                }

                                for (const key in variation.dimensions) {
                                    // Échapper les caractères spéciaux
                                    variation.dimensions[key] = variation.dimensions[key]
                                        .replace(/&/g, "&amp;")
                                        .replace(/</g, "&lt;")
                                        .replace(/>/g, "&gt;")
                                        .replace(/"/g, "&quot;")
                                        .replace(/'/g, "&#039;");

                                    // Ajout de VH{fixed} si le dernier caractère n'est pas alphanumérique
                                    if (!variation.dimensions[key].match(/[a-z0-9]$/i)) {
                                        //variation.dimensions[key] = variation.dimensions[key] + ` VH${fixed}`;
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
                };
            }

            function showMagicStars() {
                var style = document.createElement('style');
                style.innerHTML = `
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
        `;
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
                    star.style.top = `${Math.random() * window.innerHeight}px`;
                    star.style.left = `${Math.random() * window.innerWidth}px`;
                    document.body.appendChild(star);

                    // Supprimer l'étoile après l'animation
                    setTimeout(() => {
                        document.body.removeChild(star);
                    }, 3000 + Math.random() * 500);
                }
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
        // Fonction pour récupérer les données de localStorage
        function getLocalStorageData() {
            let data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.endsWith('_cache') || key.endsWith('_favori')) {
                    data[key] = localStorage.getItem(key);
                }
            }
            return data;
        }

        // Fonction pour restaurer les données dans localStorage
        function setLocalStorageData(data) {
            for (let key in data) {
                if (key.endsWith('_cache') || key.endsWith('_favori')) {
                    localStorage.setItem(key, data[key]);
                }
            }
        }

        function saveData() {
            // Récupérez toutes les clés sauvegardées
            const keys = GM_listValues();
            let data = {};

            keys.forEach(key => {
                data[key] = GM_getValue(key);
            });

            // Ajouter les données de localStorage
            const localStorageData = getLocalStorageData();
            data = { ...data, ...localStorageData };

            const formData = {
                version: version,
                token: API_TOKEN,
                settings: data,
            };
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://pickme.alwaysdata.net/shyrka/save",
                data: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json"
                },
                onload: function(response) {
                    console.log("Sauvegarde réussie");
                    const responseData = JSON.parse(response.responseText);
                    if (responseData.lastSaveDate) {
                        const restoreButton = document.getElementById('restoreData');
                        restoreButton.textContent = `(Premium) Restaurer les paramètres/produits (${convertToEuropeanDate(responseData.lastSaveDate)})`;
                    } else {
                        console.error("La date de la dernière sauvegarde n'a pas été retournée.");
                    }
                },
                onerror: function(error) {
                    console.error("Erreur lors de la sauvegarde :", error);
                }
            });
        }

        function restoreData() {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
            });
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://pickme.alwaysdata.net/shyrka/restore",
                data: formData.toString(),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload: function(response) {
                    let data = JSON.parse(response.responseText);
                    for (let key in data) {
                        if (key.endsWith('_cache') || key.endsWith('_favori')) {
                            localStorage.setItem(key, data[key]);
                        } else {
                            GM_setValue(key, data[key]);
                        }
                    }
                    console.log("Restauration réussie");
                    alert("Restauration réussie");
                    window.location.reload();
                },
                onerror: function(error) {
                    console.error("Erreur lors de la restauration :", error);
                }
            });
        }

        async function lastSave() {
            const formData = new URLSearchParams({
                version: version,
                token: API_TOKEN,
            });

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://pickme.alwaysdata.net/shyrka/lastsave",
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        if (response && response.status === 200) {
                            const data = JSON.parse(response.responseText);
                            const europeanDate = convertToEuropeanDate(data.lastSaveDate);
                            resolve(europeanDate);
                        } else if (response && response.status === 201) {
                            resolve("Aucune sauvegarde");
                        } else {
                            reject("Erreur lors de la récupération de la dernière sauvegarde");
                        }
                    },
                    onerror: function(error) {
                        reject("Erreur lors de la récupération de la dernière sauvegarde : " + error);
                    }
                });
            });
        }
        //End sauvegarde

        if (autohideEnabled) {
            setTimeout(displayContent, 600);
        } else {
            displayContent();
        }
    });
})();
