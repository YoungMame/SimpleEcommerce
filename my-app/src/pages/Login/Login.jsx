import "./login.scss"
import { useState, useEffect } from "react"
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";

export default function Login() {
	const { t } = useTranslation();
	const [formData, setFormData] = useState({
		email : "",
		password : ""
	});
	const handleChange = e => {
		const { name, value } = e.target;
		setFormData(data => ({
			...data,
			[name]: value
		}));
	}
	const tryLogin = async (event) => {
		event.preventDefault();
		try {
			const response = await fetch(`/api/user/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					password : formData.password
				})
			});

			if(!response.ok)
			{
				const errorText = await response.text();
				throw t(errorText) || `Une erreur est survenue`;
			}
			const data = await response.json();
			localStorage.setItem("mlb_jwt", data.jwt);
			window.location.href = "/";
		} catch (error) {
			toast.error(error);
		}
	}
    return (
        <>
			<form className="login-form" onSubmit={event => tryLogin(event)}>
				<label htmlFor="email">{t("login.email")}</label>
				<br />
				<input onChange={handleChange} name="email" type="email" placeholder="Email" />
				<br />
				<label htmlFor="password">{t("login.password")}</label>
				<br />
				<input onChange={handleChange} name="password" type="password" placeholder="Password" />
				<br />
				<button className="ok" type="submit">{t("login.submit")}</button>
				<a href="/signin">{t("login.signin")}</a>
				<a href="/forgotten">Mot de passe oublié?</a>
			</form>
        </>
    )
}