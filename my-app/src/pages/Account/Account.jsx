import "./account.scss";
import { useState, useEffect, useContext } from "react";
import { toast } from 'react-toastify';
import { UserContext } from "../../App.jsx";
import { useTranslation } from "react-i18next";

function	Cart() {
	let { setSelectedProduct } = useContext(UserContext);
	const { t } = useTranslation();
	const [cart, setCart] = useState(null);
	const fetchActiveCart = async () => {
		const token = localStorage.getItem("mlb_jwt");
		const response = await fetch("/api/user/cart", {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`,
			}
		})
		if(!response.ok)
		{
			const errorText = await response.text();
			return toast.error(t(`account.cart.${errorText}`));
		}
		const cart = await response.json();	
		return setCart(cart);
	}
	const changeCartItemQuantity = async (quantity, productId) => {
		if (!quantity || !productId) return ;
		const token = localStorage.getItem("mlb_jwt");
		const response = await fetch("/api/user/cart", {
			method: "PATCH",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				productId: productId,
				quantity: quantity
			})
		})
		const responseText = await response.text();
		if (!response.ok) 
			return toast.error(t(`account.cart.${responseText}`));
		fetchActiveCart();
		return toast.success(t(`account.cart.${responseText}`));
	}
	const deleteCartItem = async (productId) => {
		if (!productId) return ;
		const token = localStorage.getItem("mlb_jwt");
		const response = await fetch("/api/user/cart", {
			method: "DELETE",
			headers: {
				"Authorization": `Bearer ${token}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				productId: productId
			})
		})
		const responseText = await response.text();
		if (!response.ok) 
			return toast.error(t(`account.cart.${responseText}`));
		fetchActiveCart();
		return toast.success(t(`account.cart.${responseText}`));
	}
	useEffect(() => {
		fetchActiveCart();
	}, [])

	return <>
		<div className="cart">
			<h4>{t("account.cart.your-cart")}</h4>
			<ul className="cart__list">
				{
					cart ? 
					cart.map((item, index) => {
						return <>
							<li key={item.productId} className="cart__list__item">
								<p onClick={() => deleteCartItem(item.productId)} className="cart__list__item__delete">X</p>
								<img src={`/${item.image}`} alt="" />
								<h5>{item.title}</h5>
								<p>{item.price}€</p>
								<label htmlFor="quantity">{t("account.cart.quantity")}</label>
								<input name="quantity" type="number" onBlur={e => changeCartItemQuantity(e.target.value, item.productId)} defaultValue={item.quantity} />
							</li>
						</>
					})
					:
					null
				}
			</ul>
			<a href="/cart-validation"><button className="ok">{t("account.cart.valid-cart")}</button></a>
		</div>
	</>
}

function	Settings() {
	const { t } = useTranslation();
	const { userData, setUserData } = useContext(UserContext);
	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [phone, setPhone] = useState("");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	useEffect(() => {
		if (userData) {
			setFirstname(userData.firstname);
			setLastname(userData.lastname);
			setPhone(userData.phone);
		}
	}, [userData]);
	const Disconnect = function() {
		localStorage.removeItem("mlb_jwt");
		window.location.pathname = "/";
	}
	const SendValidationEmail = async function() {
		try {
			const token = localStorage.getItem("mlb_jwt");
			const response = await fetch("/api/user/request-validation", {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${token}`
				}
			})
			if(!response.ok)
			{
				const errorText = await response.text();
				throw t(errorText);
			}
			const successText = await response.text();	
			toast(t(successText));
		} catch (error) {
			toast.error(t(error));
		}
	}
	const UpdatePassword = async function(event) {
		event.preventDefault();
		const token = localStorage.getItem("mlb_jwt");
		try {
			const response = await fetch("/api/user/password", {
				method: "PATCH",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					oldpassword: oldPassword,
					newpassword: newPassword
				})
			})
			if(!response.ok)
			{
				const errorText = await response.text();
				throw t(errorText);
			}
			const successText = await response.text();	
			toast.success(t(successText));
		} catch (error) {
			toast.error(t(error));
		}
	}
	const UpdateUser = async function(event) {
		event.preventDefault();
		const token = localStorage.getItem("mlb_jwt");
		try {
			const response = await fetch("/api/user/", {
				method: "PATCH",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					firstname: firstname,
					lastname: lastname,
					phone: phone
				})
			})
			if(!response.ok)
			{
				const errorText = await response.text();
				throw t(errorText);
			}
			const successText = await response.text();	
			toast.success(t(successText));
		} catch (error) {
			toast.error(t(error));
		}
	}
	return <>
		<div className="settings-list">
			<h4>{t("account.settings.personnal-infos")}</h4>
			<form className="settings-list__personnal">
				<div className="settings-list__personnal__element">
					<label htmlFor="firstname">{t("account.settings.firstname")}</label>
					<input type="text" name="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)}/>
				</div>
				<div className="settings-list__personnal__element">
					<label htmlFor="lastname">{t("account.settings.lastname")}</label>
					<input type="text" name="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)}/>
				</div>
				<div className="settings-list__personnal__element">
					<label htmlFor="phone">{t("account.settings.phone-number")}</label>
					<input type="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)}/>
				</div>
				<button onClick={UpdateUser} className="ok">{t("account.settings.update-infos")}</button>
			</form>
			<form className="settings-list__personnal">
				<div className="settings-list__personnal__element">
					<label htmlFor="oldpassword">{t("account.settings.old-password")}</label>
					<input type="password" name="oldpassword" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}/>
				</div>
				<div className="settings-list__personnal__element">
					<label htmlFor="newpassword">{t("account.settings.new-password")}</label>
					<input type="password" name="newpassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
				</div>
				<button onClick={UpdatePassword} className="ok">{t("account.settings.update-password")}</button>
			</form>
			<div className="settings-list__action">
				<div className="settings-list__action__element">
					{
					userData.validated 
					? 
					<button className="neutral">{t("account.settings.email-validated")}</button> 
					: 
					<button className="ok" onClick={() => {
						SendValidationEmail();
						toast("email envoye!");
					}}>{t("account.settings.send-validation-email")}</button>
					}
					<p>{t("account.settings.send-validation-email-text")}</p>
				</div>
			</div>
			{
				userData.admin 
				? 
				<div className="settings-list__action">
					<div className="settings-list__action__element">
						<a href="/admin">Panel administrateur</a>
					</div>
				</div>
				: 
				null
			}
			<div className="settings-list__action">
				<div className="settings-list__action__element">
					<button className="error" onClick={() => Disconnect()}>{t("account.settings.deconnect")}</button>
				</div>
			</div>
		</div>
	</>
}

function CustomLink(props) {
	return (<>
	  	<a className={(window.location.pathname === props.href) ? "account-active" : ""} href={props.href}>{props.label}</a>
	</>
	)
  }

export default function Account() {
	const { t } = useTranslation();
    let actualPage
    switch (window.location.pathname) {
      case "/account/cart":
        actualPage = <Cart />
      break
      case "/account/settings":
        actualPage = <Settings />
      break
      default: actualPage = <Cart />
      break
    }
    return (
		<>
		<div className="categories-flex__container">
			<div className="categories-flex">
				<CustomLink href="/account/cart" label={t("account.cart-title")}/>
				<CustomLink href="/account/settings" label={t("account.settings-title")}/>
			</div>
		</div>
		{actualPage}
	  	</>
    );
}

