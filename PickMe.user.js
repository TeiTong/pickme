// ==UserScript==
// @name         PickMe
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Outils pour les membres du discord AVFR
// @author       Ashemka et MegaMan (avec du code de lelouch_di_britannia, FMaz008 et Thorvarium)
// @match        https://www.amazon.fr/vine/vine-items
// @match        https://www.amazon.fr/vine/vine-items?queue=*
// @exclude      https://www.amazon.fr/vine/vine-items?search=*
// @icon         https://i.ibb.co/Zd9vSZz/PM-ICO-2.png
// @updateURL    https://raw.githubusercontent.com/teitong/pickme/main/PickMe.user.js
// @downloadURL  https://raw.githubusercontent.com/teitong/pickme/main/PickMe.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

/*

NOTES:
* Votre clef API est lié à votre compte Discord

*/

(function() {
    'use strict';
    let fullloadEnabled = GM_getValue("fullloadEnabled", false);
    if (fullloadEnabled) {
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
        let hideEnabled = GM_getValue("hideEnabled", true);
        let highlightColor = GM_getValue("highlightColor", "rgba(255, 255, 0, 0.5)");
        let highlightColorFav = GM_getValue("highlightColorFav", "rgba(255, 0, 0, 0.5)");
        let taxValue = GM_getValue("taxValue", true);
        let catEnabled = GM_getValue("catEnabled", true);
        let cssEnabled = GM_getValue("cssEnabled", false);
        let headerEnabled = GM_getValue("headerEnabled", false);
        let callUrlEnabled = GM_getValue("callUrlEnabled", false);
        let callUrl = GM_getValue("callUrl", false);
        let statsEnabled = GM_getValue("statsEnabled", false);
        let extendedEnabled = GM_getValue("extendedEnabled", false);
        let wheelfixEnabled = GM_getValue("wheelfixEnabled", true);
        let autohideEnabled = GM_getValue("autohideEnabled", false);
        let favWords = GM_getValue('favWords', '');
        let hideWords = GM_getValue('hideWords', '');


        //On remplace l'image et son lien par notre menu
        function replaceImageUrl() {
            // Sélectionner le lien contenant l'image avec l'attribut alt "vine_logo_title"
            var link = document.querySelector('a > img[alt="vine_logo_title"]') ? document.querySelector('a > img[alt="vine_logo_title"]').parentNode : null;

            // Vérifier si le lien existe
            if (link) {
                // Sélectionner directement l'image à l'intérieur du lien
                var img = link.querySelector('img');
                // Remplacer l'URL de l'image
                img.src = 'https://i.ibb.co/NC96JrP/PM.png';
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

        // La fonction pour appeler une URL
        function appelURL() {
            if (/\.mp3$/i.test(callUrl)) {
                // L'URL pointe vers un fichier MP3, vous pouvez procéder à la lecture
                var audio = new Audio(callUrl);
                audio.play().catch(e => console.error("Erreur lors de la tentative de lecture de l'audio : ", e));
            } else {
                return new Promise((resolve, reject) => {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: callUrl,
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

        function setUrl() {
            // Demander à l'utilisateur de choisir une URL
            const userInput = prompt("Veuillez saisir l'URL a appeler lors de la découverte d'un nouveau produit", "").toLowerCase();
            GM_setValue("callUrl", userInput);
        }

        const apiOk = GM_getValue("apiToken", false);

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
                    etiquetteTemps.style.padding = '2px 5px';
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
            const urlIcone = 'https://i.ibb.co/1R6HWMw/314858-hidden-eye-icon.png';
            const urlIconeOeil = 'https://i.ibb.co/MNzxHrh/314859-eye-icon.png';
            // Création des boutons avec le nouveau style
            const boutonVisibles = document.createElement('button');
            boutonVisibles.textContent = 'Produits visibles';
            boutonVisibles.classList.add('bouton-filtre', 'active'); // Ajout des classes pour le style

            const boutonCaches = document.createElement('button');
            boutonCaches.textContent = 'Produits cachés';
            boutonCaches.classList.add('bouton-filtre'); // Ajout des classes pour le style

            // Ajout des boutons pour cacher tout et tout afficher
            const boutonCacherTout = document.createElement('button');
            boutonCacherTout.textContent = 'Tout cacher';
            boutonCacherTout.classList.add('bouton-action');
            boutonCacherTout.id = 'boutonCacherTout';

            const boutonToutAfficher = document.createElement('button');
            boutonToutAfficher.textContent = 'Tout afficher';
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
                iconeOeil.style.cssText = 'position: absolute; top: 0px; right: 5px; cursor: pointer; width: 35px; height: 35px; z-index: 10;';

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

                //const urlIconeFavoriGris = 'https://i.ibb.co/H7LPnYS/coeurgris.png';
                //const urlIconeFavoriRouge = 'https://i.ibb.co/kcdswPQ/coeurrouge.png';
                const urlIconeFavoriGris = 'https://i.ibb.co/2cTkDm5/coeurgris2.png';
                const urlIconeFavoriRouge = 'https://i.ibb.co/cxttfV7/coeurrouge2.png';
                const iconeFavori = document.createElement('img');

                const etatFavori = JSON.parse(localStorage.getItem(etatFavoriKey));
                iconeFavori.setAttribute('src', etatFavori && etatFavori.estFavori ? urlIconeFavoriRouge : urlIconeFavoriGris);
                iconeFavori.style.cssText = 'position: absolute; top: 8px; left: 8px; cursor: pointer; width: 23px; height: 23px; z-index: 10;';

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

        if (hideEnabled && apiOk) {
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

#navbar-main, #skiplink {
  display: none;
}

.amzn-ss-wrap {
  display: none !important;
}
`
            document.head.appendChild(styleHeader);
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

#vvp-logo-link img {
  height: var(--logo-link-height, 30px);
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

        if (imgNew && callUrlEnabled && apiOk && callUrl) {
            appelURL();
        }

        sendDatasToAPI(listElements);

        function resetEtMiseAJour() {
            imgNew = true;
            updateCat(false);
        }

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
            // Application du style CSS spécifié
            boutonReset.style.backgroundColor = '#f7ca00';
            boutonReset.style.color = 'black';
            boutonReset.style.fontWeight = 'bold';
            boutonReset.style.textDecoration = 'none';
            boutonReset.style.display = 'inline-block';
            boutonReset.style.border = '1px solid #dcdcdc';
            boutonReset.style.borderRadius = '20px';
            boutonReset.style.padding = '3px 10px';
            boutonReset.style.marginLeft = '5px';
            boutonReset.style.cursor = 'pointer';
            boutonReset.style.outline = 'none';
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
            imageElement.src = 'https://i.ibb.co/qsNvMQx/new-10785605-2-2.png';
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
                    if (purgeAll) {
                        // Purger le produit sans vérifier la date
                        delete storedProducts[asin];
                    } else {
                        // Purger le produit en fonction de la date d'expiration
                        const productDateAdded = new Date(storedProducts[asin].dateAdded).getTime(); // Convertir la date d'ajout en millisecondes
                        if (currentDate - productDateAdded >= ITEM_EXPIRY) { // Vérifier si le produit a expiré
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

            // Poser la question pour les produits cachés si purgeAll est true et les favoris
            if (purgeAll) {
                purgeHidden = confirm("Es-tu sur de vouloir supprimer tous les produits cachés ?");
                purgeFavorites = confirm("Veux-tu supprimer tous les favoris ?");
            }

            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                const isCacheKey = key.includes('_cache');
                const isFavoriKey = key.includes('_favori');

                if (isCacheKey || (purgeFavorites && isFavoriKey)) {
                    if (isCacheKey && purgeHidden) {
                        // Suppression des objets cachés si l'utilisateur a confirmé la suppression
                        localStorage.removeItem(key);
                    } else if (isFavoriKey && purgeFavorites) {
                        // Suppression des favoris si l'utilisateur a confirmé la suppression
                        localStorage.removeItem(key);
                    } else if (isCacheKey && !purgeAll) {
                        // Vérifier l'expiration des objets cachés si purgeAll n'est pas activé
                        const hiddenData = JSON.parse(localStorage.getItem(key));
                        if (new Date().getTime() - hiddenData.date >= ITEM_EXPIRY) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
        }


        //On purge les anciens produits
        purgeStoredProducts();
        purgeHiddenObjects();

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
                    gotoButtonUp.innerHTML = `<a id="goToPageButton">Page X<span class="a-letter-space"></span><span class="a-letter-space"></span></a>`;

                    // Ajouter un événement click au bouton "Aller à"
                    gotoButtonUp.querySelector('a').addEventListener('click', function() {
                        askPage();
                    });

                    // Création du bouton "Aller à la page X"
                    const gotoButton = document.createElement('li');
                    gotoButton.className = 'a-last'; // Utiliser la même classe que le bouton "Suivant" pour le style
                    gotoButton.innerHTML = `<a id="goToPageButton">Page X<span class="a-letter-space"></span><span class="a-letter-space"></span></a>`;

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
#configPopup, #keyConfigPopup, #favConfigPopup, #colorPickerPopup {
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
}

.api-token-container label {
  margin-bottom: 0 !important;
  display: block !important;
}

#configPopup h2, #configPopup label, #keyConfigPopup h2, #colorPickerPopup h2 {
  color: #333;
  margin-bottom: 20px;
}

#configPopup h2 {
  cursor: grab;
  font-size: 1.5em;
  text-align: center;
}

#keyConfigPopup h2, #favConfigPopup h2, #colorPickerPopup h2 {
  font-size: 1.5em;
  text-align: center;
}

#configPopup label, #keyConfigPopup label, #favConfigPopup label {
  display: flex;
  align-items: center;
}

#configPopup label input[type="checkbox"] {
  margin-right: 10px;
}

#configPopup .button-container,
#configPopup .checkbox-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

#configPopup .button-container button,
#configPopup .checkbox-container label {
  margin-bottom: 10px;
  flex-basis: 48%; /* Ajusté pour uniformiser l'apparence des boutons et des labels */
}

#configPopup button, #keyConfigPopup button, #favConfigPopup button {
  padding: 5px 10px;
  background-color: #f3f3f3;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
}

#configPopup button:not(.full-width), #keyConfigPopup button:not(.full-width), #favConfigPopup button:not(.full-width), , #colorPickerPopup button:not(.full-width) {
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
#saveConfig, #closeConfig, #saveKeyConfig, #closeKeyConfig, #saveFavConfig, #closeFavConfig, #saveColor, #closeColor {
  padding: 8px 15px !important; /* Plus de padding pour un meilleur visuel */
  margin-top !important: 5px;
  border-radius: 5px !important; /* Bordures légèrement arrondies */
  font-weight: bold !important; /* Texte en gras */
  border: none !important; /* Supprime la bordure par défaut */
  color: white !important; /* Texte en blanc */
  cursor: pointer !important;
  transition: background-color 0.3s ease !important; /* Transition pour l'effet au survol */
}

#saveConfig, #saveKeyConfig, #saveFavConfig, #saveColor {
  background-color: #4CAF50 !important; /* Vert pour le bouton "Enregistrer" */
}

#closeConfig, #closeKeyConfig, #closeFavConfig, #closeColor {
  background-color: #f44336 !important; /* Rouge pour le bouton "Fermer" */
}

#saveConfig:hover, #saveKeyConfig:hover, #saveFavConfig:hover, #saveColor:hover {
  background-color: #45a049 !important; /* Assombrit le vert au survol */
}

#closeConfig:hover, #closeKeyConfig:hover, #closeFavConfig:hover, #closeColor:hover {
  background-color: #e53935 !important; /* Assombrit le rouge au survol */
}
#saveKeyConfig, #closeKeyConfig, #saveFavConfig, #closeFavConfig, #saveColor, #closeColor {
  margin-top: 10px; /* Ajoute un espace de 10px au-dessus du second bouton */
  width: 100%; /* Utilise width: 100% pour assurer que le bouton prend toute la largeur */
}
`;
        document.head.appendChild(styleMenu);

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
            let isPremiumPlus = false;
            let isPremium = false;
            const responsePremiumPlus = await verifyTokenPremiumPlus(API_TOKEN);
            const responsePremium = await verifyTokenPremium(API_TOKEN);
            let apiToken = "";
            if (API_TOKEN == undefined) {
                apiToken = "";
            } else {
                isPremiumPlus = responsePremiumPlus && responsePremiumPlus.status === 200;
                isPremium = responsePremium && responsePremium.status === 200;
                apiToken = API_TOKEN;
            }
            const popup = document.createElement('div');
            popup.id = "configPopup";
            popup.innerHTML = `
    <h2 id="configPopupHeader">Paramètres PickMe v${version}<span id="closePopup" style="float: right; cursor: pointer;">&times;</span></h2>
    <div class="checkbox-container">
      ${createCheckbox('highlightEnabled', 'Surbrillance des nouveaux produits', 'Permet d\'ajouter un fond de couleur dès qu\'un nouveau produit est trouvé sur la page en cours. La couleur peut se choisir avec le bouton plus bas dans ces options.')}
      ${createCheckbox('firsthlEnabled', 'Mettre les nouveaux produits en début de page', 'Les nouveaux produits seront mis au tout début de la liste des produits sur la page en cours')}
      ${createCheckbox('paginationEnabled', 'Affichage des pages en partie haute', 'En plus des pages de navigation en partie basse, ajoute également la navigation des pages en début de liste des produits')}
      ${createCheckbox('hideEnabled', 'Pouvoir cacher des produits', 'Ajoute l\'option qui permet de cacher certains produits de votre choix ainsi que des favoris (le produit devient impossible à cacher et sera toujours mis en tête en liste sur la page), ainsi que les boutons pour tout cacher ou tout afficher en une seule fois')}
      ${createCheckbox('catEnabled', 'Différence de quantité dans les catégories', 'Afficher à côté de chaque catégorie du bandeau à gauche la différence de quantité positive ou négative par rapport à la dernière fois où vous avez vu un nouveau produit. Se réinitialise à chaque fois que vous voyez un nouveau produit ou quand vous appuyez sur le bouton "Reset"')}
      ${createCheckbox('taxValue', 'Remonter l\'affichage de la valeur fiscale estimée', 'Dans la fênetre du produit qui s\'affiche quand on clique sur "Voir les détails", remonte dans le titre la valeur fiscale du produit au lieu qu\'elle soit en fin de fenêtre')}
      ${createCheckbox('cssEnabled', 'Utiliser l\'affichage alternatif', 'Affichage réduit, pour voir plus de produits en même temps, avec également réduction de la taille des catégories. Option utile sur mobile par exemple. Non compatible avec l\'affichage du nom complet des produits')}
      ${createCheckbox('headerEnabled', 'Cacher totalement l\'entête de la page', 'Cache le haut de la page Amazon, celle avec la zone de recherche et les menus')}
      ${createCheckbox('extendedEnabled', 'Afficher le nom complet des produits', 'Affiche 4 lignes, si elles existent, au nom des produits au lieu de 2 en temps normal. Non compatible avec l\'affichage alternatif')}
      ${createCheckbox('wheelfixEnabled', 'Corriger le chargement infini des produits', 'Corrige le bug quand un produit ne charge pas (la petite roue qui tourne sans fin). Attention, même si le risque est très faible, on modifie une information transmise à Amazon, ce qui n\'est pas avec un risque de 0%')}
      ${createCheckbox('fullloadEnabled', 'N\'afficher la page qu\'après son chargement complet', 'Attend le chargement complet des modifications de PickMe avant d\'afficher la page. Cela peut donner la sensation d\'un chargement plus lent de la page mais évite de voir les produits cachés de façon succincte ou le logo Amazon par exemple')}
      ${createCheckbox('autohideEnabled', '(Premium) Cacher/Mettre en avant automatiquement selon le nom du produit', 'Permet de cacher automatiquement des produits selon des mots clés, ou au contraire d\'en mettre en avant. Peut ajouter de la latence sur le chargement de la page si l\'option précédente est activée',!isPremium)}
      ${createCheckbox('statsEnabled', '(Premium+) Afficher les statistiques produits du jour','Affiche la quantité de produits ajoutés ce jour et dans le mois à côté des catégories', !isPremiumPlus)}
      ${createCheckbox('callUrlEnabled', '(Expérimental) Appeler une URL lors de la découverte d\'un nouveau produit', 'Fonction sans support. Appelle l\'URL choisie (bouton plus bas) lors de la découverte d\'un nouveau produit. Cela peut être une API ou un MP3 (le fichier doit être donné sous la forme d\'un lien internet)')}
    </div>
     <div class="api-token-container">
      <label for="apiTokenInput">Clef API :</label>
      <input type="text" id="apiTokenInput" value="${apiToken}" style="width: 100%; max-width: 480px; margin-bottom: 10px;" />
    </div>
    ${addActionButtons(!isPremium, !isPremiumPlus)}
  `;
            document.body.appendChild(popup);

            document.getElementById('cssEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('extendedEnabled').checked = false;
                }
            });

            document.getElementById('extendedEnabled').addEventListener('change', function() {
                if (this.checked) {
                    document.getElementById('cssEnabled').checked = false;
                }
            });

            document.getElementById('closePopup').addEventListener('click', () => {
                document.getElementById('configPopup').remove();
            });

            // Ajoute des écouteurs pour les nouveaux boutons
            document.getElementById('setHighlightColor').addEventListener('click', setHighlightColor);
            document.getElementById('setHighlightColorFav').addEventListener('click', setHighlightColorFav);
            document.getElementById('configurerTouches').addEventListener('click', configurerTouches);
            document.getElementById('configurerFiltres').addEventListener('click', configurerFiltres);
            document.getElementById('syncProducts').addEventListener('click', syncProducts);
            document.getElementById('setUrl').addEventListener('click', setUrl);
            document.getElementById('purgeStoredProducts').addEventListener('click', () => {
                if (confirm("Es-tu sûr de vouloir supprimer les produits enregistrés pour la surbrillance ?")) {
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
            //alert('Configuration sauvegardée.');
            window.location.reload();
            document.getElementById('configPopup').remove();
        }

        // Ajoute les boutons pour les actions spécifiques qui ne sont pas juste des toggles on/off
        function addActionButtons(isPremium, isPremiumPlus) {
            return `
<div class="button-container action-buttons">
  <button id="setHighlightColor">Définir la couleur de surbrillance des nouveaux produits</button>
  <button id="setHighlightColorFav">Définir la couleur de surbrillance des produits filtrés par nom</button>
  <button id="configurerFiltres" ${isPremium ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ''}>(Premium) Configurer les mots pour le filtre</button>
  <button id="syncProducts" ${isPremiumPlus ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ''}>(Premium+) Synchroniser les produits</button>
  <button id="configurerTouches">Configurer les touches</button>
  <button id="setUrl">(Expérimental) Choisir l'URL à appeler</button>
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
            <label for="hideWords">Produits à cacher :</label>
            <textarea id="hideWords" name="hideWords" style="width: 100%; height: 110px">${GM_getValue('hideWords', '')}</textarea>
        </div><br>
<p style="font-size: 0.9em; color: #666;">Note&nbsp;: chaque recherche différente doit être séparée par une virgule. Les majuscules ne sont pas prises en compte. Exemple&nbsp;: coque iphone, chat, HUB.<br>Si un produit est à la fois favori et à cacher, il ne sera pas caché.</p>
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
        purgeOldItems();

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
                    url: `https://apishyrka.alwaysdata.net/shyrka/user/${token}`,
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
                    url: `https://apishyrka.alwaysdata.net/shyrka/userpremiumplus/${token}`,
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
                    url: `https://apishyrka.alwaysdata.net/shyrka/userpremium/${token}`,
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
                    url: "https://apishyrka.alwaysdata.net/shyrka/product",
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
        if (statsEnabled && apiOk && window.location.href.startsWith("https://www.amazon.fr/vine/vine-items?queue=")) {
            // Appeler la fonction pour afficher les stats
            qtyProducts();
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
                    url: "https://apishyrka.alwaysdata.net/shyrka/products",
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

        //Appel API pour synchroniser
        function syncProducts() {
            const formData = new URLSearchParams({
                version: version, // Assurez-vous que les valeurs sont des chaînes
                token: API_TOKEN, // Remplacez API_TOKEN par la valeur de votre token
            });

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://apishyrka.alwaysdata.net/shyrka/sync", // Assurez-vous que l'URL est correcte
                    data: formData.toString(),
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 300) {
                            try {
                                // Tente de parser le texte de réponse en JSON
                                const productsData = JSON.parse(response.responseText); // Parsez le JSON de la réponse
                                syncProductsData(productsData); // Traitez les données
                                //console.log(jsonResponse); // Affiche la réponse parsée dans la console
                                resolve(productsData); // Résout la promesse avec l'objet JSON
                            } catch (error) {
                                console.error("Erreur lors du parsing JSON:", error);
                                reject(error); // Rejette la promesse si le parsing échoue
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
                version: version, // Assurez-vous que les valeurs sont des chaînes
                token: API_TOKEN, // Remplacez API_TOKEN par la valeur de votre token
            });

            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://apishyrka.alwaysdata.net/shyrka/qtyproducts", // Assurez-vous que l'URL est correcte
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

        //Affichage des données reçu par l'API
        function qtyProductsData(productsData) {
            // Trouve le conteneur où ajouter les informations
            const container = document.getElementById('vvp-browse-nodes-container');

            // Crée un nouveau div pour afficher les informations
            const infoDiv = document.createElement('div');
            infoDiv.style.padding = '0';
            infoDiv.style.margin = '0';

            // Ajoute les informations au div
            infoDiv.innerHTML = `
        <p style="margin:0; font-weight: bold; text-decoration: underline;">Nouveaux produits :</p>
        <p style="margin:0;">Autres articles : ${productsData[0].ai}</p>
        <p style="margin:0;">Disponible pour tous : ${productsData[0].afa}</p>
        <p style="margin:0;">Total jour : ${productsData[0].total}</p>
        <p style="margin:0; margin-bottom: 1em;">Total mois : ${productsData[0].total_month}</p>
    `;

            // Insère le nouveau div dans le conteneur, sous le bouton "Afficher tout"
            if (container) {
                const referenceNode = container.querySelector('p');
                if (referenceNode) {
                    // Insère le nouveau div dans le conteneur, sous le bouton "Afficher tout" si l'élément de référence existe
                    container.insertBefore(infoDiv, referenceNode.nextSibling);
                } else {
                    // Si l'élément de référence n'existe pas, tu peux choisir un autre comportement,
                    // par exemple ajouter infoDiv à la fin du conteneur
                    container.appendChild(infoDiv);
                }
            }
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
                    const etatCacheKey = asin + '_cache';
                    localStorage.setItem(etatCacheKey, JSON.stringify({ estCache: false }));
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
                    // Hide the Share button; no need to show it when there are errors
                    document.querySelector("button.a-button-discord").style.display = 'none';
                } else if (wasPosted === queueType) {
                    // Product was already posted from the same queue before
                    updateButtonIcon(4);
                } else if (!isModalHidden) {
                    updateButtonIcon(0);
                    document.querySelector("button.a-button-discord").addEventListener("click", buttonHandler);
                }

            });

            try {
                observer.observe(target, config);
            } catch(error) {
                console.log('Aucun produits sur cette page');
            }
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
                }
            }
            setTimeout(tryAutoHide, 600);
        }

        //Wheel Fix
        if (wheelfixEnabled && apiOk) {
            // Intercept Fetch requests
            const origFetch = window.fetch;
            var interceptor_LastParentVariant = null;
            var interceptor_responseData = {};
            var interceptor_postData = {};

            unsafeWindow.fetch = async (...args) => {
                let response = await origFetch(...args);
                let lastParent = interceptor_LastParentVariant;
                let regex = null;

                regex = /^api\/recommendations\/.*$/;
                if (regex.test(args[0])) {
                    await response
                        .clone()
                        .json()
                        .then(function (data) {
                        interceptor_responseData = data;
                    })
                        .catch((err) => console.error(err));

                    if (interceptor_responseData.result.variations !== undefined) {
                        let variations = interceptor_responseData.result.variations;
                        let fixed = 0;
                        for (let i = 0; i < variations.length; ++i) {
                            let value = variations[i];
                            if (isObjectEmpty(value.dimensions)) {
                                interceptor_responseData.result.variations[i].dimensions = {
                                    asin_no: value.asin,
                                };
                                fixed++;
                            }
                        }

                        for (let i = 0; i < variations.length; ++i) {
                            let variation = variations[i];
                            let before = "";
                            let arrKeys = Object.keys(variation.dimensions);
                            for (let j = 0; j < arrKeys.length; j++) {
                                before = variation.dimensions[arrKeys[j]];
                                variation.dimensions[arrKeys[j]] = variation.dimensions[arrKeys[j]].replace(/[)(:\[\]&]/g, "");

                                if (before != variation.dimensions[arrKeys[j]]) {
                                    fixed++;
                                }
                            }
                        }

                        if (fixed > 0) {
                            // Déclencher l'animation
                            showMagicStars();
                        }
                    }

                    return new Response(JSON.stringify(interceptor_responseData));
                } else {
                    return response;
                }
            };


            function showMagicStars() {
                var style = document.createElement('style');
                style.innerHTML = `
            @keyframes sparkle {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(1); opacity: 0; }
            }
            .star {
                position: fixed;
                color: #FFD700; /* Or */
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

                // Créer le texte "PickMe Fix"
                var magicText = document.createElement('div');
                magicText.className = 'magic-text';
                magicText.textContent = 'PickMe Fix';
                document.body.appendChild(magicText);

                // Supprimer le texte après 3 secondes
                setTimeout(() => {
                    document.body.removeChild(magicText);
                }, 3000);

                // Créer et afficher les étoiles
                for (let i = 0; i < 50; i++) {
                    let star = document.createElement('div');
                    star.className = 'star';
                    star.textContent = '★';
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
        if (autohideEnabled) {
            setTimeout(displayContent, 600);
        } else {
            displayContent();
        }
    });
})();
