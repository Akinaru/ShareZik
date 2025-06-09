import React from "react";

const MyAccount: React.FC = () => {
    return (
        <div className="my-account-page" style={{ padding: "2rem" }}>
            <h1>Mon Compte</h1>
            <section>
                <h2>Informations personnelles</h2>
                <p>Nom : Jean Dupont</p>
                <p>Email : jean.dupont@email.com</p>
                {/* Ajoutez ici d'autres informations ou un formulaire de modification */}
            </section>
            <section>
                <h2>Paramètres</h2>
                <button>Modifier le mot de passe</button>
                {/* Ajoutez d'autres paramètres si nécessaire */}
            </section>
        </div>
    );
};

export default MyAccount;