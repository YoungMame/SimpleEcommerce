import "./signin.scss"
import { useState, useEffect } from "react"
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";

export default function Signin() {
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
	const trySignin = async (event) => {
		event.preventDefault();
		try {
			const response = await fetch(`/api/user/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					password : formData.password,
					firstname: formData.firstname,
					lastname : formData.lastname,
					birthdate: formData.birthdate
				})
			});

			if(!response.ok)
			{
				const errorText = await response.text();
				throw t(errorText) || `Une erreur est survenue`;
			}
			window.location.href = "/";
		} catch (error) {
			toast.error(error);
		}
	}
    return (
        <>
			<form className="signin-form" onSubmit={event => trySignin(event)}>
				<label htmlFor="email">{t("signin.email")}</label>
				<br />
				<input onChange={handleChange} name="email" type="email" placeholder="Email" />
				<br />
				<label htmlFor="firstname">{t("signin.firstname")}</label>
				<br />
				<input onChange={handleChange} name="firstname" type="text" placeholder="Firstname" />
				<br />
				<label htmlFor="lastname">{t("signin.lastname")}</label>
				<br />
				<input onChange={handleChange} name="lastname" type="text" placeholder="Lastname" />
				<br />
				<label htmlFor="birthdate">{t("signin.birthdate")}</label>
				<br />
				<input onChange={handleChange} name="birthdate" type="date" />
				<br />
				<label htmlFor="password">{t("signin.password")}</label>
				<br />
				<input onChange={handleChange} name="password" type="password" placeholder="Password" />
				<br />
				<p className="warning">{t("signin.password-infos")}</p>
				<button className="ok" type="submit">{t("signin.submit")}</button>
				<a href="/login">{t("signin.signin")}</a>
			</form>
        </>
    )
}