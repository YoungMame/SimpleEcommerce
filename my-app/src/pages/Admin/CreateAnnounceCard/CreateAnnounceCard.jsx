import "../AnnounceCard/announcecard.scss";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

export default function CreateAnnounceCard({ onClose }) {
	const [selectedAnnounce, setSelectedAnnounce] = useState({}); 
	const [selectedPicture, setSelectedPicture] = useState(null);
	const [previewPicture, setPreviewPicture] = useState(null);
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
	const handlePictureChange = function(e) {
		const file = e.target.files[0];		
		if (file) {
			const imagePreviewUrl = URL.createObjectURL(file);
			setSelectedPicture(file);  
			setPreviewPicture(imagePreviewUrl);
		}
	};
	const handlePictureDelete = (index) => {
		setSelectedAnnounce(prevData => ({
		  ...prevData,
		  image: null
		}));
		setSelectedPicture(null);
		setPreviewPicture(null);
	};	  
	const createAnnounce = async function() {
		onClose();
		try {
			const token = localStorage.getItem("mlb_jwt");
			const formData = new FormData();
			if (!token) return toast.error("Vous n'avez pas de jeton d'authentification");
			for (const key in selectedAnnounce) {
				if (key !== "image")
					formData.append(key, selectedAnnounce[key]);
			}
			if (selectedPicture)
				formData.append("image", selectedPicture);
			const response = await fetch(`/api/announce`, {
				method: "POST",
				headers : {
					"Authorization" : `Bearer ${token}`
				},
				body : formData
			})
			if (!response.ok)
			{
				throw await response.text();
			}
		} catch (error) {
			toast.error(error);
		}
	};
	if (!selectedAnnounce) return (null);
	return (
		<div className="announce-card">
			<div className="announce-card__close" onClick={onClose}>x</div>
			<div className="announce-card__infos">
				<label htmlFor="pictures">Image</label>
				<input className="announce-card__input-pictures" name="pictures" type="file" onChange={e => handlePictureChange(e)} accept="image/*" />
				<div className="announce-card__picture">
					{
						previewPicture ?
						<img src={previewPicture} alt="Selected image" />
						:
						<img src="/no_image.jpg" alt="No image" />
					}
				</div>
				<label htmlFor="title">Titre</label>
				<input name="title" type="text" value={selectedAnnounce.title} onChange={e => handleChange(e)} className="announce-card__infos__email" />
				<label htmlFor="text">Message</label>
				<textarea name="text" type="text" value={selectedAnnounce.text} onChange={e => handleChange(e)} />
				<label htmlFor="author">Auteur</label>
				<input name="author" type="text" value={selectedAnnounce.author} onChange={e => handleChange(e)} />
				<label htmlFor="place">Lieu</label>
				<input name="place" type="text" value={selectedAnnounce.place} onChange={e => handleChange(e)} />
				<label htmlFor="date">Date</label>
				<input name="date" type="date" value={selectedAnnounce.date} onChange={e => handleChange(e)} />
				<label htmlFor="duration">Durée (en heures)</label>
				<input name="duration" type="number" value={selectedAnnounce.duration} onChange={e => handleChange(e)}/>
			</div>
			<div className="announce-card__buttons">
				<button className="success" onClick={createAnnounce}>Créer le produit</button>
			</div>
		</div>
	)
}