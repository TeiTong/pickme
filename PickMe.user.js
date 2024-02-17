// ==UserScript==
// @name         PickMe
// @namespace    http://tampermonkey.net/
// @version      0.41
// @description  Aide pour discord AVFR
// @author       lelouch_di_britannia (modifié par Ashemka et Tei Tong, avec des idées de FMaz008)
// @match        https://www.amazon.fr/vine/vine-items
// @match        https://www.amazon.fr/vine/vine-items?queue=*
// @exclude      https://www.amazon.fr/vine/vine-items?search=*
// @exclude      https://www.amazon.fr/vine/vine-items?queue=potluck*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.fr
// @updateURL    https://raw.githubusercontent.com/teitong/pickme/main/PickMe.user.js
// @downloadURL  https://raw.githubusercontent.com/teitong/pickme/main/PickMe.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

/*

NOTES:
* Votre clef API est lié à votre compte Discord

*/

(function() {
    'use strict';

    (GM_getValue("config")) ? GM_getValue("config") : GM_setValue("config", {}); // initialize the list of items that were posted to Discord

    //PickMe add
    // Initialiser ou lire la configuration existante
    let highlightEnabled = GM_getValue("highlightEnabled", true); // Par défaut, la fonctionnalité est activée
    let paginationEnabled = GM_getValue("paginationEnabled", true); // Par défaut, la fonctionnalité est activée
    let highlightColor = GM_getValue("highlightColor", "rgba(255, 255, 0, 0.5)");

    // Fonction pour demander à l'utilisateur s'il souhaite activer/désactiver la fonctionnalité
    function askhighlightPreference() {
        let userWantsHighlight = confirm("Voulez-vous activer la subrillance des nouveaux objets ? OK pour activer, Annuler pour désactiver.");
        GM_setValue("highlightEnabled", userWantsHighlight);
        return userWantsHighlight;
    }

    function askpaginationPreference() {
        let userWantsPagination = confirm("Voulez-vous activer l'affichage des pages au dessus des produits ? OK pour activer, Annuler pour désactiver.");
        GM_setValue("paginationEnabled", userWantsPagination);
        return userWantsPagination;
    }

    function setHighlightColor() {
        // Demander à l'utilisateur de choisir une couleur
        const userInput = prompt("Veuillez saisir la couleur de surbrillance, soit par son nom, soit par sa valeur hexadécimale (exemple : Jaune (#FFFF00), Bleu (#0096FF), Rouge (#FF0000), Vert (#96FF96), etc..)", "").toLowerCase();

        // Correspondance des noms de couleurs à leurs codes hexadécimaux
        const colorMap = {
            jaune: "#FFFF00",
            bleu: "#0096FF",
            rouge: "#FF0000",
            vert: "#96FF96",
            orange: "#FF9600",
            violet: "#9600FF",
            rose: "#FF00FF"
        };

        // Vérifier si l'entrée de l'utilisateur correspond à une couleur prédéfinie
        const userColor = colorMap[userInput] || userInput;

        // Vérifier si la couleur est une couleur hexadécimale valide (avec ou sans #)
        const isValidHex = /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(userColor);

        if (isValidHex) {
            // Supprimer le '#' si présent et normaliser la saisie en format 6 caractères
            let normalizedHex = userColor.replace('#', '');
            if (normalizedHex.length === 3) {
                normalizedHex = normalizedHex.split('').map(char => char + char).join('');
            }

            // Convertir hex en rgb
            const r = parseInt(normalizedHex.substr(0, 2), 16);
            const g = parseInt(normalizedHex.substr(2, 2), 16);
            const b = parseInt(normalizedHex.substr(4, 2), 16);

            // Format rgba avec 50% de transparence
            const rgbaColor = `rgba(${r}, ${g}, ${b}, 0.5)`;

            // Stocker la couleur convertie
            GM_setValue("highlightColor", rgbaColor);
            alert("La couleur de surbrillance a été mise à jour à " + userInput);
        } else {
            // Utiliser couleur de fallback si saisie invalide
            GM_setValue("highlightColor", 'rgba(255, 255, 0, 0.5)');
            alert("La saisie n'est pas une couleur valide. La couleur de surbrillance a été réinitialisée à Jaune.");
        }
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

    //Navigation des pages avec les touches du clavier
    document.addEventListener('keydown', function(e) {
        // Touche Q ou flèche gauche
        if (e.key === 'q' || e.key === 'ArrowLeft') {
            naviguerPage(-1);
        }
        // Touche D ou flèche droite
        else if (e.key === 'd' || e.key === 'ArrowRight') {
            naviguerPage(1);
        }
    });

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
    if (highlightEnabled) {
        // Appeler la fonction pour ajouter les étiquettes de temps
        ajouterEtiquetteTemps();
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

    addGlobalStyle(`.a-button-discord-icon { background-image: url(https://m.media-amazon.com/images/S/sash/ZNt8quAxIfEMMky.png); content: ""; padding: 10px 10px 10px 10px; background-size: 512px 512px; background-repeat: no-repeat; margin-right: 5px; vertical-align: middle; }`)
    addGlobalStyle(`.a-button-discord.mobile-vertical { margin-top: 7px; margin-left: 0px; }`)

    //PickMe add
    const urlParams = new URLSearchParams(window.location.search);
    const productsCont = document.querySelectorAll('.vvp-item-product-title-container > a.a-link-normal');
    let valeurQueue = urlParams.get('queue');
    const valeurPn = parseInt(urlParams.get('pn'), 10) || 0; // Utilisez 0 comme valeur par défaut si pn n'est pas défini
    const valeurCn = parseInt(urlParams.get('cn'), 10) || 0; // Utilisez 0 comme valeur par défaut si cn n'est pas défini
    let valeurPage = urlParams.get('page') || '1'; // '1' est utilisé comme valeur par défaut
    // Vérifiez et ajustez valeurQueue en fonction de valeurPn
    if (valeurQueue === 'encore' || valeurQueue === 'last_chance') {
        if (valeurPn > 0) {
            valeurQueue = valeurPn.toString();
        }
    }
    // Ajustez valeurPage en fonction de valeurCn, si nécessaire
    if (valeurCn > 0) {
        valeurPage = valeurCn.toString();
    }
    const listElements = [];

    productsCont.forEach(element => {
        const urlComp = element.href;
        listElements.push(urlComp);
        if (highlightEnabled) {
            const asin = element.href.split('/dp/')[1].split('/')[0]; // Extrait l'ASIN du produit
            const parentDiv = element.closest('.vvp-item-tile'); // Trouver le div parent à mettre en surbrillance
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
                if (parentDiv) {
                    parentDiv.style.backgroundColor = highlightColor;
                }
            }
        }
    });

    sendDatasToAPI(listElements);

    const urlData = window.location.href.match(/(amazon\..+)\/vine\/vine-items(?:\?queue=)?(encore|last_chance|potluck)?.*?(?:&page=(\d+))?$/); // Country and queue type are extrapolated from this
    //End
    const MAX_COMMENT_LENGTH = 900;
    const ITEM_EXPIRY = 7776000000; // 90 days in ms
    // Icons for the Share button
    const btn_discordSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -15 130 130" style="height: 25px;width: 26px;margin-right: 4px;">
        <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" style="fill: #5865f2;"></path>
    </svg>`;
    const btn_loadingAnim = `<span class="a-spinner a-spinner-small" style="margin-right: 5px;"></span>`;
    const btn_checkmark = `<span class='a-button-discord a-button-discord-icon a-button-discord-success' style='background-position: -83px -137px;'></span>`;
    const btn_warning = `<span class='a-button-discord a-button-discord-icon a-button-discord-warning' style='background-position: -83px -117px;'></span>`;
    const btn_error = `<span class='a-button-discord a-button-discord-icon a-button-discord-error' style='background-position: -451px -421px;'></span>`;
    const btn_info = `<span class='a-button-discord a-button-discord-icon a-button-discord-info' style='background-position: -257px -353px;'></span>`;

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

    //On purge les anciens produits
    purgeStoredProducts();

    //On affiche les pages en haut si l'option est activé
    if (paginationEnabled) {
        // Sélection du contenu HTML du div source
        const sourceContent = document.querySelector('.a-text-center').outerHTML;

        // Création d'un nouveau div pour le contenu copié
        const newDiv = document.createElement('div');
        newDiv.innerHTML = sourceContent;
        newDiv.style.textAlign = 'center'; // Centrer le contenu
        newDiv.style.paddingBottom = '10px'; // Ajouter un petit espace après

        // Sélection du div cible où le contenu sera affiché
        const targetDiv = document.getElementById('vvp-items-grid-container');

        // Insertion du nouveau div au début du div cible
        targetDiv.insertBefore(newDiv, targetDiv.firstChild);
    }

    //Menu PickMe
    GM_registerMenuCommand("Configurer la préférence de surbrillance", function() {
        askhighlightPreference();
    }, "h");
    GM_registerMenuCommand("Définir la couleur de surbrillance", function() {
        setHighlightColor();
    }, "i");
    GM_registerMenuCommand("Configurer l'affichage des pages sur la partie haute", function() {
        askpaginationPreference();
    }, "j");
    GM_registerMenuCommand("Supprimer les produits enregistrés pour la surbrillance", function() {
        purgeStoredProducts(true);
        alert("Tous les produits ont été supprimés.");
    }, "k");
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
                        alert("Clef API invalide !");
                        reject("Invalid API token");
                    } else {
                        alert("Vérification de la clef échoué. Merci d'essayer plus tard.");
                        reject("Authorization failed");
                    }
                } catch (error) {
                    console.error("Error verifying API token:", error);
                    reject(error);
                }
            } else {
                reject("Error: User closed the prompt. A valid API token is required.");
            }
        });
    }

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

    // Checks if each dropdown has more than 1 selection
    // Useful for pointing out misleading product photos when viewed on Vine
    function countVariations(obj, notes) {
        for (const key in obj) {
            if (Array.isArray(obj[key]) && obj[key].length > 1) {
                return null; // If there are multiple variations, then we're better off not alerting anyone
            }
        }
        return "Parent and child ASINs don't match.";
    }

    function writeComment(productData) {
        var comment = [];
        (productData.seller) ? comment.push(`Vendeur: ${productData.seller}`) : null;
        (productData.isLimited) ? comment.push(":hourglass: Limited") : null;
        (productData.variations) ? comment.push(variationFormatting(productData.variations)) : null;

        var notes = [];
        (productData.differentChild) ? notes.push(countVariations(productData.variations)) : null;
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
        var variations = returnVariations();
        productData.variations = (Object.keys(variations).length > 0) ? variations : null;
        productData.isLimited = (document.querySelector('#vvp-product-details-modal--limited-quantity').style.display !== 'none') ? true : false;
        productData.asin = parentAsin;
        productData.differentChild = (parentAsin !== childAsin) ? true : false; // comparing the asin loaded in the modal to the one on the webpage
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
            version: 0.41,
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
    function sendDatasToAPI(data) {
        const formData = new URLSearchParams({
            version: 0.41,
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

    let parentAsin, queueType;

    // As much as I hate this, this adds event listeners to all of the "See details" buttons
    document.querySelectorAll('.a-button-primary.vvp-details-btn > .a-button-inner > input').forEach(function(element) {
        element.addEventListener('click', function() {

            parentAsin = this.getAttribute('data-asin');
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

            if (hasError || queueType == null || window.location.href.includes('?search')) {
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
            console.log('No items on the page.');
        }

    });

})();
