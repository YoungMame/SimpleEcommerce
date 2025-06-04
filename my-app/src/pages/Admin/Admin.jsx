import "./admin.scss";
import { useState, useEffect } from "react";
import UserCard from "../Admin/UserCard/UserCard.jsx";
import ProductCard from "../Admin/ProductCard/ProductCard.jsx";
import CreateProductCard from "../Admin/CreateProductCard/CreateProductCard.jsx";
import AnnounceCard from "../Admin/AnnounceCard/AnnounceCard.jsx";
import CreateAnnounceCard from "../Admin/CreateAnnounceCard/CreateAnnounceCard.jsx";
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";

function	Announces() {
	const { t } = useTranslation();
	const limit = 20;
	const [announces, setAnnounces] = useState([]);
	const [selectedAnnounce, setSelectedAnnounce] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const fetchAnnounces = async function(search, page, limit) {
		try {
			const token = localStorage.getItem("mlb_jwt");
			const response = await fetch(`/api/announce/?search=${search}&page=${page}&limit=${limit}`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`
				}
			})
			if(!response.ok)
			{
				const errorText = await response.text();
				throw t(errorText);
			}
			const tAnnounces = await response.json();	
			setAnnounces(tAnnounces.result);
		} catch (error) {
			toast.error(t(error));
		}
	}
	useEffect(() => {
		fetchAnnounces(search, page, limit);
	}, [page, search, selectedAnnounce, isCreating]);
	return <>
		<div className="users-container">
			<button className="ok" onClick={() => setIsCreating(true)}>Ecrire une annonce</button>
			{
				isCreating ?
				<CreateAnnounceCard onClose={() => setIsCreating(false)}/>
				:
				null
			}
			<h4>Liste des annonces</h4>
			<input onChange={e => setSearch(e.target.value)} type="text" className="user-search" placeholder="Titre de l'annonce"/>
			<div className="users-page">
				{
					(page > 1) ? <div onClick={() => setPage(page - 1)}>-</div> : <div>-</div> 
				}
				<div>{page}</div>
				{
					(announces.length == limit) ? <div onClick={() => setPage(page + 1)}>+</div> : <div>+</div> 
				}
			</div>
			<div className="users-list">
				{announces.map(announce => (
					<div onClick={() => setSelectedAnnounce(announce)} key={announce._id} className="users-list__user">
						<p className="users-list__user__email">{announce.title}</p>
						<p className="users-list__user__id">par {announce.author}</p>
					</div>
				))}
			</div>
		</div>
		{
			selectedAnnounce ? <AnnounceCard announce={selectedAnnounce} onClose={() => setSelectedAnnounce(null)} /> : null
		}
	</>
}

function	Users() {
	const { t } = useTranslation();
	const limit = 3;
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const fetchUsers = async function(search, page, limit) {
		try {
			const token = localStorage.getItem("mlb_jwt");
			const response = await fetch(`/api/user/?search=${search}&page=${page}&limit=${limit}`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`,
				}
			})
			if(!response.ok)
			{
				const errorText = await response.text();
				throw t(errorText);
			}
			const tUsers = await response.json();	
			setUsers(tUsers);
		} catch (error) {
			toast.error(t(error));
		}
	}
	useEffect(() => {
		fetchUsers(search, page, limit);
	}, [page, search, selectedUser]);
	return <>
	<div className="users-container">
		<h4>Liste des utilisateurs</h4>
		<input onChange={e => setSearch(e.target.value)} type="text" className="user-search" placeholder="Email de l'utilisateur"/>
		<div className="users-page">
			{
				(page > 1) ? <div onClick={() => setPage(page - 1)}>-</div> : <div>-</div> 
			}
			<div>{page}</div>
			{
				(users.length == limit) ? <div onClick={() => setPage(page + 1)}>+</div> : <div>+</div> 
			}
		</div>
		<div className="users-list">
			{users.map(user => (
				<div onClick={() => setSelectedUser(user)} key={user.email} className="users-list__user">
					<p className="users-list__user__email">{user.email}</p>
					<p className="users-list__user__id">{user._id}</p>
				</div>
			))}
		</div>
	</div>
	{
		selectedUser ? <UserCard user={selectedUser} onClose={() => setSelectedUser(null)} /> : null
	}
		
	</>
}

function	Products() {
	const { t } = useTranslation();
	const limit = 20;
	const [products, setProducts] = useState([]);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [isCreating, setIsCreating] = useState(false);
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const fetchProducts = async function(search, page, limit) {
		try {
			const token = localStorage.getItem("mlb_jwt");
			const response = await fetch(`/api/product/?search=${search}&page=${page}&limit=${limit}`, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`
				}
			})
			if(!response.ok)
			{
				const errorText = await response.text();
				throw t(errorText);
			}
			const tProducts = await response.json();	
			setProducts(tProducts.result);
		} catch (error) {
			toast.error(t(error));
		}
	}
	useEffect(() => {
		fetchProducts(search, page, limit);
	}, [page, search, selectedProduct, isCreating]);
	return <>
		<div className="users-container">
			<button className="ok" onClick={() => setIsCreating(true)}>Creer un produit</button>
			{
				isCreating ?
				<CreateProductCard onClose={() => setIsCreating(false)}/>
				:
				null
			}
			<h4>Liste des produits</h4>
			<input onChange={e => setSearch(e.target.value)} type="text" className="user-search" placeholder="Reference du produit"/>
			<div className="users-page">
				{
					(page > 1) ? <div onClick={() => setPage(page - 1)}>-</div> : <div>-</div> 
				}
				<div>{page}</div>
				{
					(products.length == limit) ? <div onClick={() => setPage(page + 1)}>+</div> : <div>+</div> 
				}
			</div>
			<div className="users-list">
				{products.map(product => (
					<div onClick={() => setSelectedProduct(product)} key={product._id} className="users-list__user">
						<p className="users-list__user__email">{product.productCode}</p>
						<p className="users-list__user__id">{product.title}</p>
					</div>
				))}
			</div>
		</div>
	{
		selectedProduct ? <ProductCard product={selectedProduct} onClose={() => setSelectedProduct(null)} /> : null
	}
		
	</>
}

function CustomLink(props) {
	return (<>
	  <a className={(window.location.pathname === props.href) ? "admin-active" : ""} href={props.href}>{props.label}</a>
	</>
	)
  }

export default function Admin() {
    let actualPage
    switch (window.location.pathname) {
      case "/admin/users":
        actualPage = <Users />
      break
	  case "/admin/products":
        actualPage = <Products />
      break
      case "/admin/announces":
        actualPage = <Announces />
      break
      default: actualPage = null
      break
    }
    return (
		<>
			<div className="categories-grid">
				<CustomLink href="/admin/products" label="Produits"/>
				<CustomLink href="/admin/users" label="Utilisateurs"/>
				<CustomLink href="/admin/announces" label="Annonces"/>
			</div>
			{actualPage}
	  	</>
    );
}

