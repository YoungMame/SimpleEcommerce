import "./forgotten.scss";
import { useState, } from "react";
import { toast } from 'react-toastify';
import { useTranslation } from "react-i18next";

export default function Forgotten() {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [isSent, setIsSent] = useState("");
	const SendEmail = async function(e) {
		e.preventDefault();
		setIsSent(true);
		try {
			const response = await fetch(`/api/user/request-forgotten/${email}`, {
				method: "POST"
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

	return (
		<form>
			<label htmlFor="email">{t("forgotten.email")}</label>
			<input required type="email" name="email" onChange={e => setEmail(e.target.value)}/>
			{isSent ?
				<button className="neutral" disabled>{t("forgotten.email-sent")}</button>
				:
				<button className="ok" onClick={SendEmail}>{t("forgotten.send-email")}</button>
			}
		</form>
	)
}