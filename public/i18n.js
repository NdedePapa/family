// i18n - Internationalization for Family Tree App
// Supports: English (en) and French (fr)

const translations = {
  en: {
    appTitle: 'My Family Tree',
    appSubtitle: 'A shared living record of our family',
    
    // Header
    searchPlaceholder: 'Search by name…',
    connecting: 'Connecting…',
    connected: 'Connected',
    adminMode: 'Admin mode (edit/delete)',
    toggleTheme: 'Toggle light/dark mode',
    howToUse: 'How to use this app',
    backup: 'Backup',
    import: 'Import',
    requests: 'Requests',
    fitScreen: 'Fit whole tree on screen',
    addMember: 'Add Member',
    members: 'members',
    generations: 'gens',
    
    // Connection status
    connLoading: 'Loading…',
    connOk: 'Connected · {count} members',
    connError: 'Cannot reach server',
    
    // Canvas hints
    hintDesktop: 'Scroll to zoom · Drag to pan · Click any name to see details',
    hintMobile: 'Pinch to zoom · Drag to pan · Tap a name for details',
    
    // Sidebar
    parent: 'Parent',
    years: 'Years',
    hometown: 'Hometown',
    addedBy: 'Added By',
    notes: 'Notes',
    notRecorded: 'Not recorded',
    present: 'present',
    addChild: 'Add Child',
    addParent: 'Add Parent',
    addAncestor: 'Add Ancestor',
    edit: 'Edit',
    delete: 'Delete',
    requestChange: 'Request Change',
    childrenOf: 'Children of {name} ({count})',
    noChildren: 'No children recorded yet.',
    pressAddChild: 'Press <strong style="color:var(--gold)">＋ Add Child</strong> above to add one.',
    
    // Gender
    female: 'Female',
    male: 'Male',
    genderNotRecorded: 'Gender not recorded',
    nonBinary: 'Other / Non-binary',
    
    // Generations
    genAncestors: '▲ Ancestors — above Nana Aku',
    genDescendants: '▼ Nana Aku and her descendants',
    genGreatGreatGrandparents: '−3 · Great-great-grandparents',
    genGreatGrandparents: '−2 · Great-grandparents',
    genGrandparents: '−1 · Grandparents of Nana Aku',
    genParents: '0 · Parents of Nana Aku',
    genI: 'Gen I — Nana Aku (Matriarch)',
    genII: 'Gen II — Children',
    genIII: 'Gen III — Grandchildren',
    genIV: 'Gen IV — Great-Grandchildren',
    genV: 'Gen V — 5th Generation',
    genVI: 'Gen VI — 6th Generation',
    genVII: 'Gen VII — 7th Generation',
    genVIII: 'Gen VIII — 8th Generation',
    genIX: 'Gen IX — 9th Generation',
    genX: 'Gen X — 10th Generation',
    
    // Modals
    addFamilyMember: 'Add a Family Member',
    editMember: 'Edit: {name}',
    fillDetails: 'Fill in what you know — you can always edit later. Fields marked <span style="color:#e57373">*</span> are required.',
    updateDetails: 'Update this person\'s details. All fields are optional except Name and Added By.',
    fullName: 'Full Name',
    namePlaceholder: 'e.g. Kofi Mensah  or  Abena Nyarko',
    nameHint: 'Write the name as the family knows it. You can include nicknames in brackets, e.g. "Victoria Tandoh (Sister Mother)"',
    gender: 'Gender',
    notSpecified: 'Not specified',
    generation: 'Generation',
    genWhere: '— where in the tree?',
    genHintDefault: 'When adding a child, the generation is set automatically — you usually don\'t need to change this.',
    genHintAncestor: 'You are adding someone above Nana Aku. This is for ancestors — her parents, grandparents, etc.',
    parentLabel: 'Parent',
    parentWho: '— who is this person\'s mother or father in the tree?',
    parentUnknown: '— Unknown / no parent yet —',
    parentHint: '⚠ Always select a parent so the person appears in the right place. If you added them using "＋ Add Child", this is already filled in.',
    birthYear: 'Birth Year',
    birthPlaceholder: 'e.g. 1945',
    deathYear: 'Death Year',
    deathHint: '— leave blank if alive',
    deathPlaceholder: 'e.g. 2010',
    hometownLabel: 'Hometown',
    hometownPlaceholder: 'e.g. Accra, Cape Coast, Kumasi…',
    addedByLabel: 'Added By',
    addedByYourName: '— your own name',
    addedByPlaceholder: 'Your name, so we know who added this',
    addedByHint: 'This helps the family know who to ask if details need checking.',
    notesLabel: 'Notes',
    notesPlaceholder: 'Occupation, story, nickname, anything useful about this person…',
    optional: '— optional',
    required: '*',
    cancel: 'Cancel',
    saveMember: 'Save Member',
    saveChanges: 'Save Changes',
    saveAncestor: 'Save Ancestor',
    saving: 'Saving…',
    
    // Export/Backup
    backupTitle: 'Backup Your Family Data',
    backupDesc: 'Your data is saved automatically on every change. Download a backup file as extra insurance.',
    totalMembers: 'Total members',
    generationsCount: 'Generations',
    backupTip: '💡 <strong style="color:var(--ink2)">Tip:</strong> Download a backup after any session where you\'ve added new members. Store it on your phone\'s gallery, WhatsApp, or email it to yourself. You can restore from this file at any time using the <strong>Import</strong> feature.',
    close: 'Close',
    downloadBackup: 'Download Backup File',
    
    // Import/Restore
    importTitle: 'Import Family Data',
    importDesc: 'Restore your family tree from a backup file. This will replace all current data.',
    importWarning: '⚠️ <strong>Warning:</strong> This will delete all current members and replace them with the imported data. Make sure you have a backup of your current data before proceeding.',
    selectFile: 'Select Backup File',
    adminPasswordRequired: 'Admin Password Required',
    importButton: 'Import Data',
    importing: 'Importing…',
    
    // Change Requests
    changeRequestsTitle: 'Change Requests from Family',
    changeRequestsDesc: 'Review correction requests submitted by family members who can\'t edit directly.',
    noRequests: 'No change requests yet.',
    noRequestsDesc: 'Family members can click <strong>📝 Request Change</strong> on any member card to suggest corrections.',
    pendingRequests: '⚠ Pending Requests ({count})',
    resolvedDismissed: '✓ Resolved/Dismissed ({count})',
    viewMember: 'View Member',
    markResolved: 'Mark Resolved',
    dismiss: 'Dismiss',
    requestedBy: 'Requested by',
    resolved: 'RESOLVED',
    dismissed: 'DISMISSED',
    
    // Delete Confirmation
    deleteTitle: 'Delete this member?',
    deleteMessage: '"{name}" will be permanently removed from the family tree. This cannot be undone.',
    noCancel: 'No, cancel',
    yesConfirm: 'Yes, confirm',
    
    // Toast messages
    toastSaved: '✓ Changes saved',
    toastAdded: '✓ {name} added to the tree',
    toastDeleted: 'Deleted from the tree',
    toastBackup: '✓ Backup downloaded ({count} members)',
    toastImported: '✓ Import successful - {count} members restored',
    toastNewMembers: '🌱 {count} new member{s} added by someone!',
    toastChangeSubmitted: '✓ Change request submitted! The admin will review it.',
    toastRequestResolved: '✓ Request marked as resolved',
    toastRequestDismissed: 'Request dismissed',
    toastAdminUnlocked: '✓ Admin mode unlocked',
    toastAdminLocked: '👁 Viewer mode: Edit/Delete locked',
    toastErrorName: '⚠ Please enter the person\'s full name',
    toastErrorAddedBy: '⚠ Please enter your name in the "Added By" field',
    toastErrorPassword: '⚠ Incorrect password',
    toastErrorEdit: '⚠ Edit mode requires admin access. Click the 🔒 button to unlock.',
    toastErrorDelete: '⚠ Delete requires admin access. Click the 🔒 button to unlock.',
    toastErrorChildren: '⚠ {name} has children on the tree. Delete or reassign their children first.',
    toastErrorImport: '⚠ Import requires admin password',
    toastErrorFile: '⚠ Please select a valid backup file',
    
    // Welcome Modal
    welcomeTitle: 'Welcome to the My Family Tree',
    welcomeSubtitle: 'A shared living record of our family — every member can add to it from any phone or computer.',
    step1Title: 'Click any name',
    step1Desc: 'Tap or click a name on the tree to see that person\'s details, their children, and quick action buttons.',
    step2Title: 'Add a family member',
    step2Desc: 'Click <strong>＋ Add Member</strong> in the top bar, or click a person on the tree and press <strong>＋ Add Child</strong> to add their child directly.',
    step3Title: 'Search & Navigate',
    step3Desc: 'Use the search bar to find anyone instantly. Zoom with <strong>＋/−</strong> or scroll/pinch. Click <strong>⊙</strong> to fit the whole tree.',
    step4Title: 'Admin Mode (optional)',
    step4Desc: 'To edit or delete members, click the <strong>🔒 lock button</strong> and enter the admin password. Otherwise, you can only add new members.',
    faqGeneration: 'What is "Generation"?',
    faqGenerationAnswer: 'It tells the tree how many steps below Nana Aku a person is. <strong>Gen I = Nana Aku</strong>, <strong>Gen II = her children</strong>, <strong>Gen III = her grandchildren</strong>, and so on. When you add a child, the generation is filled in automatically — you don\'t need to change it.',
    faqParent: 'What is "Parent"?',
    faqParentAnswer: 'This links the person to their mother or father in the tree. Always select a parent so the person appears in the right place. If you\'re unsure, leave it blank and edit it later.',
    faqAncestor: 'Can I add Nana Aku\'s own mother or grandmother?',
    faqAncestorAnswer: 'Yes! Click <strong>Nana Aku</strong> on the tree, then press <strong>▲ Add Ancestor</strong>. The form will guide you. Her ancestors appear above her at the top of the tree in purple.',
    faqSearch: 'How do I find someone quickly?',
    faqSearchAnswer: 'Type their name in the <strong>search bar</strong> at the top. Matching people will glow — everyone else will fade out.',
    faqZoom: 'The tree is too small / hard to read',
    faqZoomAnswer: 'Use the <strong>＋ / −</strong> zoom buttons on the right, or scroll/pinch on your device. Press <strong>⊙</strong> to fit the whole tree on screen again. You can also drag to move around.',
    faqAddedBy: 'What does "Added By" mean?',
    faqAddedByAnswer: 'It\'s where you put <em>your own name</em> — so the family knows who contributed each record. This helps when information needs to be checked or corrected.',
    faqAdmin: '🔒 What is Admin Mode?',
    faqAdminAnswer: 'By default, everyone can <strong>view and add members</strong>. To protect the tree, <strong>Edit</strong> and <strong>Delete</strong> require admin access. Click the <strong>🔒 lock button</strong> in the top bar and enter the password to unlock admin mode.',
    faqRequest: 'What if I spot a mistake but can\'t edit?',
    faqRequestAnswer: 'Click the person\'s card and press <strong>📝 Request Change</strong>. Describe the correction needed — the admin will receive your request and can make the fix.',
    faqTheme: '☀/🌙 Can I change the appearance?',
    faqThemeAnswer: 'Yes! Click the <strong>☀ sun/moon button</strong> in the top bar to toggle between light and dark mode. Your preference is saved automatically.',
    gotIt: 'Got it — let\'s go! 🌳',
    
    // Prompts
    promptChangeRequest: 'Suggest a correction for "{name}":\n\nDescribe what needs to be changed (name spelling, birth year, parent link, etc.):',
    promptRequesterName: 'Your name (so the admin knows who to contact):',
    promptAdminPassword: '🔐 Enter admin password to unlock Edit and Delete:',
    promptImportPassword: '🔐 Enter admin password to import data:',
    
    // Legend
    legendTitle: 'Generations',
  },
  
  fr: {
    appTitle: 'Mon Arbre Généalogique',
    appSubtitle: 'Un registre vivant partagé de notre famille',
    
    // Header
    searchPlaceholder: 'Rechercher par nom…',
    connecting: 'Connexion…',
    connected: 'Connecté',
    adminMode: 'Mode administrateur (modifier/supprimer)',
    toggleTheme: 'Basculer en mode clair/sombre',
    howToUse: 'Comment utiliser cette application',
    backup: 'Sauvegarde',
    import: 'Importer',
    requests: 'Demandes',
    fitScreen: 'Ajuster l\'arbre à l\'écran',
    addMember: 'Ajouter un Membre',
    members: 'membres',
    generations: 'générations',
    
    // Connection status
    connLoading: 'Chargement…',
    connOk: 'Connecté · {count} membres',
    connError: 'Impossible de joindre le serveur',
    
    // Canvas hints
    hintDesktop: 'Défilez pour zoomer · Glissez pour déplacer · Cliquez sur un nom pour voir les détails',
    hintMobile: 'Pincez pour zoomer · Glissez pour déplacer · Appuyez sur un nom pour les détails',
    
    // Sidebar
    parent: 'Parent',
    years: 'Années',
    hometown: 'Ville natale',
    addedBy: 'Ajouté par',
    notes: 'Notes',
    notRecorded: 'Non enregistré',
    present: 'présent',
    addChild: 'Ajouter un Enfant',
    addParent: 'Ajouter un Parent',
    addAncestor: 'Ajouter un Ancêtre',
    edit: 'Modifier',
    delete: 'Supprimer',
    requestChange: 'Demander une Modification',
    childrenOf: 'Enfants de {name} ({count})',
    noChildren: 'Aucun enfant enregistré pour le moment.',
    pressAddChild: 'Appuyez sur <strong style="color:var(--gold)">＋ Ajouter un Enfant</strong> ci-dessus pour en ajouter un.',
    
    // Gender
    female: 'Féminin',
    male: 'Masculin',
    genderNotRecorded: 'Genre non enregistré',
    nonBinary: 'Autre / Non-binaire',
    
    // Generations
    genAncestors: '▲ Ancêtres — au-dessus de Nana Aku',
    genDescendants: '▼ Nana Aku et ses descendants',
    genGreatGreatGrandparents: '−3 · Arrière-arrière-grands-parents',
    genGreatGrandparents: '−2 · Arrière-grands-parents',
    genGrandparents: '−1 · Grands-parents de Nana Aku',
    genParents: '0 · Parents de Nana Aku',
    genI: 'Gén I — Nana Aku (Matriarche)',
    genII: 'Gén II — Enfants',
    genIII: 'Gén III — Petits-enfants',
    genIV: 'Gén IV — Arrière-petits-enfants',
    genV: 'Gén V — 5ème Génération',
    genVI: 'Gén VI — 6ème Génération',
    genVII: 'Gén VII — 7ème Génération',
    genVIII: 'Gén VIII — 8ème Génération',
    genIX: 'Gén IX — 9ème Génération',
    genX: 'Gén X — 10ème Génération',
    
    // Modals
    addFamilyMember: 'Ajouter un Membre de la Famille',
    editMember: 'Modifier : {name}',
    fillDetails: 'Remplissez ce que vous savez — vous pouvez toujours modifier plus tard. Les champs marqués <span style="color:#e57373">*</span> sont obligatoires.',
    updateDetails: 'Mettez à jour les détails de cette personne. Tous les champs sont facultatifs sauf Nom et Ajouté par.',
    fullName: 'Nom Complet',
    namePlaceholder: 'par ex. Kofi Mensah  ou  Abena Nyarko',
    nameHint: 'Écrivez le nom tel que la famille le connaît. Vous pouvez inclure des surnoms entre parenthèses, par ex. "Victoria Tandoh (Sister Mother)"',
    gender: 'Genre',
    notSpecified: 'Sélectionner le genre',
    generation: 'Génération',
    genWhere: '— où dans l\'arbre ?',
    genHintDefault: 'Lors de l\'ajout d\'un enfant, la génération est définie automatiquement — vous n\'avez généralement pas besoin de la modifier.',
    genHintAncestor: 'Vous ajoutez quelqu\'un au-dessus de Nana Aku. C\'est pour les ancêtres — ses parents, grands-parents, etc.',
    parentLabel: 'Parent',
    parentWho: '— qui est la mère ou le père de cette personne dans l\'arbre ?',
    parentUnknown: '— Inconnu / pas encore de parent —',
    parentHint: '⚠ Sélectionnez toujours un parent pour que la personne apparaisse au bon endroit. Si vous l\'avez ajoutée en utilisant "＋ Ajouter un Enfant", ceci est déjà rempli.',
    birthYear: 'Année de Naissance',
    birthPlaceholder: 'par ex. 1945',
    deathYear: 'Année de Décès',
    deathHint: '— laissez vide si vivant',
    deathPlaceholder: 'par ex. 2010',
    hometownLabel: 'Ville natale',
    hometownPlaceholder: 'par ex. Accra, Cape Coast, Kumasi…',
    addedByLabel: 'Ajouté par',
    addedByYourName: '— votre propre nom',
    addedByPlaceholder: 'Votre nom, pour que nous sachions qui l\'a ajouté',
    addedByHint: 'Cela aide la famille à savoir à qui demander si les détails doivent être vérifiés.',
    notesLabel: 'Notes',
    notesPlaceholder: 'Profession, histoire, surnom, tout ce qui est utile à propos de cette personne…',
    optional: '— facultatif',
    required: '*',
    cancel: 'Annuler',
    saveMember: 'Enregistrer le Membre',
    saveChanges: 'Enregistrer les Modifications',
    saveAncestor: 'Enregistrer l\'Ancêtre',
    saving: 'Enregistrement…',
    
    // Export/Backup
    backupTitle: 'Sauvegarder vos Données Familiales',
    backupDesc: 'Vos données sont sauvegardées automatiquement à chaque modification. Téléchargez un fichier de sauvegarde comme assurance supplémentaire.',
    totalMembers: 'Total des membres',
    generationsCount: 'Générations',
    backupTip: '💡 <strong style="color:var(--ink2)">Astuce :</strong> Téléchargez une sauvegarde après toute session où vous avez ajouté de nouveaux membres. Stockez-la dans la galerie de votre téléphone, WhatsApp, ou envoyez-la par e-mail. Vous pouvez restaurer à partir de ce fichier à tout moment en utilisant la fonction <strong>Importer</strong>.',
    close: 'Fermer',
    downloadBackup: 'Télécharger le Fichier de Sauvegarde',
    
    // Import/Restore
    importTitle: 'Importer des Données Familiales',
    importDesc: 'Restaurez votre arbre généalogique à partir d\'un fichier de sauvegarde. Cela remplacera toutes les données actuelles.',
    importWarning: '⚠️ <strong>Attention :</strong> Cela supprimera tous les membres actuels et les remplacera par les données importées. Assurez-vous d\'avoir une sauvegarde de vos données actuelles avant de continuer.',
    selectFile: 'Sélectionner le Fichier de Sauvegarde',
    adminPasswordRequired: 'Mot de passe administrateur requis',
    importButton: 'Importer les Données',
    importing: 'Importation…',
    
    // Change Requests
    changeRequestsTitle: 'Demandes de Modification de la Famille',
    changeRequestsDesc: 'Examinez les demandes de correction soumises par les membres de la famille qui ne peuvent pas modifier directement.',
    noRequests: 'Aucune demande de modification pour le moment.',
    noRequestsDesc: 'Les membres de la famille peuvent cliquer sur <strong>📝 Demander une Modification</strong> sur n\'importe quelle carte de membre pour suggérer des corrections.',
    pendingRequests: '⚠ Demandes en Attente ({count})',
    resolvedDismissed: '✓ Résolues/Rejetées ({count})',
    viewMember: 'Voir le Membre',
    markResolved: 'Marquer comme Résolu',
    dismiss: 'Rejeter',
    requestedBy: 'Demandé par',
    resolved: 'RÉSOLU',
    dismissed: 'REJETÉ',
    
    // Delete Confirmation
    deleteTitle: 'Supprimer ce membre ?',
    deleteMessage: '"{name}" sera définitivement supprimé de l\'arbre généalogique. Cette action ne peut pas être annulée.',
    noCancel: 'Non, annuler',
    yesConfirm: 'Oui, confirmer',
    
    // Toast messages
    toastSaved: '✓ Modifications enregistrées',
    toastAdded: '✓ {name} ajouté à l\'arbre',
    toastDeleted: 'Supprimé de l\'arbre',
    toastBackup: '✓ Sauvegarde téléchargée ({count} membres)',
    toastImported: '✓ Importation réussie - {count} membres restaurés',
    toastNewMembers: '🌱 {count} nouveau{s} membre{s} ajouté{s} par quelqu\'un !',
    toastChangeSubmitted: '✓ Demande de modification soumise ! L\'administrateur l\'examinera.',
    toastRequestResolved: '✓ Demande marquée comme résolue',
    toastRequestDismissed: 'Demande rejetée',
    toastAdminUnlocked: '✓ Mode administrateur déverrouillé',
    toastAdminLocked: '👁 Mode visualisation : Modification/Suppression verrouillées',
    toastErrorName: '⚠ Veuillez entrer le nom complet de la personne',
    toastErrorAddedBy: '⚠ Veuillez entrer votre nom dans le champ "Ajouté par"',
    toastErrorPassword: '⚠ Mot de passe incorrect',
    toastErrorEdit: '⚠ Le mode modification nécessite un accès administrateur. Cliquez sur le bouton 🔒 pour déverrouiller.',
    toastErrorDelete: '⚠ La suppression nécessite un accès administrateur. Cliquez sur le bouton 🔒 pour déverrouiller.',
    toastErrorChildren: '⚠ {name} a des enfants dans l\'arbre. Supprimez ou réassignez d\'abord leurs enfants.',
    toastErrorImport: '⚠ L\'importation nécessite le mot de passe administrateur',
    toastErrorFile: '⚠ Veuillez sélectionner un fichier de sauvegarde valide',
    
    // Welcome Modal
    welcomeTitle: 'Bienvenue dans Mon Arbre Généalogique',
    welcomeSubtitle: 'Un registre vivant partagé de notre famille — chaque membre peut y contribuer depuis n\'importe quel téléphone ou ordinateur.',
    step1Title: 'Cliquer sur un nom',
    step1Desc: 'Appuyez ou cliquez sur un nom dans l\'arbre pour voir les détails de cette personne, ses enfants et les boutons d\'action rapide.',
    step2Title: 'Ajouter un membre de la famille',
    step2Desc: 'Cliquez sur <strong>＋ Ajouter un Membre</strong> dans la barre supérieure, ou cliquez sur une personne dans l\'arbre et appuyez sur <strong>＋ Ajouter un Enfant</strong> pour ajouter directement son enfant.',
    step3Title: 'Rechercher et Naviguer',
    step3Desc: 'Utilisez la barre de recherche pour trouver quelqu\'un instantanément. Zoomez avec <strong>＋/−</strong> ou défilez/pincez. Cliquez sur <strong>⊙</strong> pour ajuster l\'arbre entier.',
    step4Title: 'Mode Administrateur (facultatif)',
    step4Desc: 'Pour modifier ou supprimer des membres, cliquez sur le <strong>bouton de verrouillage 🔒</strong> et entrez le mot de passe administrateur. Sinon, vous ne pouvez qu\'ajouter de nouveaux membres.',
    faqGeneration: 'Qu\'est-ce que la "Génération" ?',
    faqGenerationAnswer: 'Cela indique à l\'arbre combien de niveaux en dessous de Nana Aku se trouve une personne. <strong>Gén I = Nana Aku</strong>, <strong>Gén II = ses enfants</strong>, <strong>Gén III = ses petits-enfants</strong>, et ainsi de suite. Lorsque vous ajoutez un enfant, la génération est remplie automatiquement — vous n\'avez pas besoin de la modifier.',
    faqParent: 'Qu\'est-ce que le "Parent" ?',
    faqParentAnswer: 'Cela relie la personne à sa mère ou à son père dans l\'arbre. Sélectionnez toujours un parent pour que la personne apparaisse au bon endroit. Si vous n\'êtes pas sûr, laissez-le vide et modifiez-le plus tard.',
    faqAncestor: 'Puis-je ajouter la mère ou la grand-mère de Nana Aku ?',
    faqAncestorAnswer: 'Oui ! Cliquez sur <strong>Nana Aku</strong> dans l\'arbre, puis appuyez sur <strong>▲ Ajouter un Ancêtre</strong>. Le formulaire vous guidera. Ses ancêtres apparaissent au-dessus d\'elle en haut de l\'arbre en violet.',
    faqSearch: 'Comment trouver quelqu\'un rapidement ?',
    faqSearchAnswer: 'Tapez son nom dans la <strong>barre de recherche</strong> en haut. Les personnes correspondantes brilleront — les autres s\'estomperont.',
    faqZoom: 'L\'arbre est trop petit / difficile à lire',
    faqZoomAnswer: 'Utilisez les boutons de zoom <strong>＋ / −</strong> à droite, ou défilez/pincez sur votre appareil. Appuyez sur <strong>⊙</strong> pour ajuster à nouveau l\'arbre entier à l\'écran. Vous pouvez également glisser pour vous déplacer.',
    faqAddedBy: 'Que signifie "Ajouté par" ?',
    faqAddedByAnswer: 'C\'est là que vous mettez <em>votre propre nom</em> — pour que la famille sache qui a contribué chaque enregistrement. Cela aide lorsque les informations doivent être vérifiées ou corrigées.',
    faqAdmin: '🔒 Qu\'est-ce que le Mode Administrateur ?',
    faqAdminAnswer: 'Par défaut, tout le monde peut <strong>voir et ajouter des membres</strong>. Pour protéger l\'arbre, <strong>Modifier</strong> et <strong>Supprimer</strong> nécessitent un accès administrateur. Cliquez sur le <strong>bouton de verrouillage 🔒</strong> dans la barre supérieure et entrez le mot de passe pour déverrouiller le mode administrateur.',
    faqRequest: 'Que faire si je repère une erreur mais ne peux pas la modifier ?',
    faqRequestAnswer: 'Cliquez sur la carte de la personne et appuyez sur <strong>📝 Demander une Modification</strong>. Décrivez la correction nécessaire — l\'administrateur recevra votre demande et pourra effectuer la correction.',
    faqTheme: '☀/🌙 Puis-je changer l\'apparence ?',
    faqThemeAnswer: 'Oui ! Cliquez sur le <strong>bouton soleil/lune ☀</strong> dans la barre supérieure pour basculer entre le mode clair et sombre. Votre préférence est enregistrée automatiquement.',
    gotIt: 'Compris — allons-y ! 🌳',
    
    // Prompts
    promptChangeRequest: 'Suggérer une correction pour "{name}" :\n\nDécrivez ce qui doit être modifié (orthographe du nom, année de naissance, lien parent, etc.) :',
    promptRequesterName: 'Votre nom (pour que l\'administrateur sache qui contacter) :',
    promptAdminPassword: '🔐 Entrez le mot de passe administrateur pour déverrouiller Modifier et Supprimer :',
    promptImportPassword: '🔐 Entrez le mot de passe administrateur pour importer les données :',
    
    // Legend
    legendTitle: 'Générations',
  }
};

// Current language
let currentLang = 'en';

// Get translation
function t(key, replacements = {}) {
  let text = translations[currentLang][key] || translations['en'][key] || key;
  
  // Replace placeholders like {name}, {count}
  Object.keys(replacements).forEach(k => {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), replacements[k]);
  });
  
  return text;
}

// Set language
function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    try {
      localStorage.setItem('myFamilyLang', lang);
    } catch(e) {}
    return true;
  }
  return false;
}

// Get current language
function getLanguage() {
  return currentLang;
}

// Load saved language preference
function loadLanguage() {
  try {
    const saved = localStorage.getItem('myFamilyLang');
    if (saved && translations[saved]) {
      currentLang = saved;
    }
  } catch(e) {}
}

// Initialize
loadLanguage();
