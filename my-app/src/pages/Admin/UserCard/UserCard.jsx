import "./usercard.scss";
import { toast } from 'react-toastify';

const deleteUser = async function(userEmail, onClose) {
	if (prompt("Vous êtes sur ?") != "oui")
		return ;
	onClose();
	try {
		const token = localStorage.getItem("mlb_jwt");
		if (!token) return toast.error("Vous n'avez pas de jeton d'authentification");
		const response = await fetch("/api/user", {
			method: "DELETE",
			headers : {
				"Content-Type" : "application/json",
				"Authorization" : `Bearer ${token}`
			},
			body: JSON.stringify({
				email : userEmail
			})
		})
		if (!response.ok)
		{
			throw await response.text();
		}
	} catch (error) {
		toast.error(error);
	}
}

const setAdmin = async function(userEmail, value, onClose) {
	if (prompt("Vous êtes sur ?") != "oui")
		return ;
	onClose();
	try {
		const token = localStorage.getItem("mlb_jwt");
		if (!token) return toast.error("Vous n'avez pas de jeton d'authentification");
		const response = await fetch("/api/user/set-admin", {
			method: "PATCH",
			headers : {
				"Content-Type" : "application/json",
				"Authorization" : `Bearer ${token}`
			},
			body: JSON.stringify({
				email : userEmail,
				admin : value
			})
		})
		if (!response.ok)
		{
			throw await response.text();
		}
	} catch (error) {
		toast.error(error);
	}
}

export default function UserCard({ user, onClose }) {
	if (!user) return null;

	return (
		<div className="user-card">
			<div className="user-card__close" onClick={onClose}>x</div>
			<div className="user-card__infos">
				<h4 className="user-card__infos__email">{user.email} {user.validated ? <>(validé)</> : null}</h4>
				<p>Prénom: {user.firstname}</p>
				<p>Nom: {user.lastname}</p>
				<p>Téléphone: {user.phone}</p>
				{user.admin ? <p>Est admin: OUI</p> : <p>Est admin: NON</p>}
			</div>
			<div className="user-card__buttons">
				<button className="error" onClick={() => deleteUser(user.email, onClose)}>Supprimer l'utilisateur</button>
				{
					user.admin ?
					<button className="neutral" onClick={() => setAdmin(user.email, false, onClose)}>Mettre non administrateur</button>
					:
					<button className="neutral" onClick={() => setAdmin(user.email, true, onClose)}>Mettre administrateur</button>
				}
			</div>
		</div>
	)
}