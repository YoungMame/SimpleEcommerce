import "./announcecard.scss";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

export default function AnnounceCard({ announce, onClose }) {
	const [selectedAnnounce, setSelectedAnnounce] = useState(announce);
	const updateAnnounce = async function() {
		try {
			const token = localStorage.getItem("mlb_jwt");
			const formData = new FormData();
			if (!token) throw ("Vous n'avez pas de jeton d'authentification");
			const response = await fetch(`/api/announce/${selectedAnnounce._id}`, {
				method: "PATCH",
				headers : {
					"Authorization" : `Bearer ${token}`,
				},
				body : formData
			});
			if (!response.ok)
			{
				throw await response.text();
			}
			onClose();
		} catch (error) {
			toast.error(error);
		}
	}
	const deleteAnnounce = async function() {
		onClose();
		try {
			const token = localStorage.getItem("mlb_jwt");
			if (!token) return toast.error("Vous n'avez pas de jeton d'authentification");
			const response = await fetch(`/api/announce/${selectedAnnounce._id}`, {
				method: "DELETE",
				headers : {
					"Authorization" : `Bearer ${token}`
				}
			})
			if (!response.ok)
			{
				throw await response.text();
			}
		} catch (error) {
			toast.error(error);
		}
	}
	const handleChange = function(event) {
		let value = event.target.value;
		let name = event.target.name;
		let type = event.target.type;
		let checked = event.target.checked;
		if (type == "checkbox") value = checked;
		if (name == "quantity") value = parseInt(value);
		setSelectedAnnounce((prevalue) => {
		  return {
			...prevalue,   // Spread Operator               
			[name]: value
		  }
		})
	};  
	if (!selectedAnnounce) return null;
	return (
		<div className="announce-card">
			<div className="announce-card__close" onClick={onClose}>x</div>
			<div className="announce-card__infos">
				<img src={selectedAnnounce.image ? `/${selectedAnnounce.image}` : "/no_image.jpg"}/>
				<label htmlFor="title">Titre</label>
				<input name="title" type="text" value={selectedAnnounce.title} onChange={e => handleChange(e)} className="announce-card__infos__email" />
				<label htmlFor="text">Message</label>
				<textarea name="text" value={selectedAnnounce.text} onChange={e => handleChange(e)} />
				<label htmlFor="author">Auteur</label>
				<input name="author" type="text" value={selectedAnnounce.author} onChange={e => handleChange(e)} />
				<label htmlFor="place">Lieu</label>
				<input type="text" name="place" value={selectedAnnounce.place} onChange={e => handleChange(e)} />
				<label htmlFor="date">Date</label>
				<input name="date" type="date" value={(selectedAnnounce.date instanceof Date) ? selectedAnnounce.date.split("T")[0] : null} onChange={e => handleChange(e)} />
				<label htmlFor="duration">Durée (en heures)</label>
				<input name="duration" type="number" value={selectedAnnounce.duration} onChange={e => handleChange(e)}/>
			</div>
			<div className="announce-card__buttons">
				<button className="ok" onClick={updateAnnounce}>Mettre à jour</button>
				<button className="error" onClick={deleteAnnounce}>supprimer</button>
			</div>
		</div>
	)
}