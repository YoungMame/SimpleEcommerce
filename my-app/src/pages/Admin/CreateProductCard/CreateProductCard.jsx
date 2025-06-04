import "../ProductCard/productcard.scss";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

export default function CreateProductCard({ onClose }) {
	const [isLiverable, setIsLiverable] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState({
		title: "", 
		productCode: "", 
		price: 0, 
		description: "",
		tags: "", 
		featured: false, 
		quantity: 0, 
		pictures: [], 
		deliveryWeight: 0.0, 
		specialDelivery : false
	}); 
	const [selectedPictures, setSelectedPictures] = useState([]);
	const [previewPictures, setPreviewPictures] = useState([]);
	const handleChange = function(event) {
		let value = event.target.value;
		let name = event.target.name;
		let type = event.target.type;
		let checked = event.target.checked;
		if (type == "checkbox") value = checked;
		if (name == "quantity") value = parseInt(value);
		setSelectedProduct((prevalue) => {
		  return {
			...prevalue,   // Spread Operator               
			[name]: value
		  }
		})
	};
	const handlePicturesChange = function(e) {
		const filesArray = Array.from(e.target.files);		
		const newSelectedPictures = selectedPictures.concat(filesArray);
		const newPreviewPictures = filesArray.map(file => URL.createObjectURL(file));
		setSelectedPictures(newSelectedPictures);
		setPreviewPictures(prevData => [...prevData, ...newPreviewPictures]);
		setSelectedProduct(prevData => ({
		  ...prevData,
		  pictures: newSelectedPictures
		}));
	};
	const handlePicturesDelete = (index) => {
		setSelectedProduct(prevData => ({
		  ...prevData,
		  pictures: prevData.pictures.filter((_, i) => i !== index)
		}));
		setSelectedPictures(prevData => prevData.filter((_, i) => i !== index));
		setPreviewPictures(prevData => prevData.filter((_, i) => i !== index));
	};	  
	const createProduct = async function() {
		onClose();
		try {
			const token = localStorage.getItem("mlb_jwt");
			const formData = new FormData();
			if (!token) return toast.error("Vous n'avez pas de jeton d'authentification");
			for (const key in selectedProduct) {
				if (key !== "pictures")
					formData.append(key, selectedProduct[key]);
			}
			if (selectedProduct.pictures && selectedProduct.pictures.length > 0) {
				for (let i = 0; i < selectedProduct.pictures.length; i++) {
					formData.append("pictures", selectedProduct.pictures[i]);
				}
			}
			const response = await fetch(`/api/product`, {
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
	}
	useEffect(() => {
		if (isLiverable == false) {
			setSelectedProduct(prevData => {
				return {
					...prevData,
					deliveryWeight: 0.0
				}
			})
		}
	}, [isLiverable])
	if (!selectedProduct) return null;
	return (
		<div className="product-card">
			<div className="product-card__close" onClick={onClose}>x</div>
			<div className="product-card__infos">
				<label htmlFor="productCode">Réference</label>
				<input name="productCode" type="text" value={selectedProduct.productCode} onChange={e => handleChange(e)} className="product-card__infos__email" />
				<label htmlFor="title">Titre</label>
				<input name="title" type="text" value={selectedProduct.title} onChange={e => handleChange(e)} />
				<label htmlFor="price">Prix</label>
				<input name="price" type="number" value={selectedProduct.price} onChange={e => handleChange(e)} />
				<label htmlFor="description">Description</label>
				<textarea name="description" value={selectedProduct.description} onChange={e => handleChange(e)} />
				<label htmlFor="quantity">Quantité</label>
				<input name="quantity" type="number" value={selectedProduct.quantity} onChange={e => handleChange(e)} />
				<label htmlFor="tags">Mots-clés</label>
				<input name="tags" type="text" value={selectedProduct.tags} onChange={e => handleChange(e)} placeholder="Objet de bar, Objet moderne, bar, moderne..." />
				<label htmlFor="featured">A la une ?</label>
				<input type="checkbox" name="featured" checked={selectedProduct.featured} onChange={e => handleChange(e)} />
				<label htmlFor="livery">En livraison ?</label>
				<input type="checkbox" name="livery" checked={isLiverable} onChange={e => setIsLiverable(!isLiverable)} />
				{
					isLiverable ?
					<>
						<label htmlFor="deliveryWeight">Poids du colis (en KGs)</label>
						<input name="deliveryWeight" type="number" value={selectedProduct.deliveryWeight} onChange={e => handleChange(e)} />
					</>
					:
					null
				}
				<label htmlFor="specialDelivery">En livraison sous devis ?</label>
				<input name="specialDelivery" type="checkbox" checked={selectedProduct.specialDelivery} onChange={e => handleChange(e)}/>
			</div>
			<label htmlFor="pictures">Images</label>
            <input className="product-card__input-pictures" name="pictures" type="file" onChange={e => handlePicturesChange(e)} accept="image/*" multiple />
			<div className="product-card__pictures">
				{
					previewPictures.map((preview, index) => {
						return (
						<div className="product-card__pictures__container">
							<img src={preview} alt="" />
							<div className="product-card__pictures__container__delete" onClick={() => handlePicturesDelete(index)}>x</div>
						</div>
						)
					})
				}
			</div>
			<div className="product-card__buttons">
				<button className="success" onClick={createProduct}>Créer le produit</button>
			</div>
		</div>
	)
}