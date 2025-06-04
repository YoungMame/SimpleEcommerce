import "./footer.scss";
import { useTranslation } from "react-i18next";

export default function Footer() {
	const { t } = useTranslation();

	return (
		<footer>
			<div className="footer-list">
				<div className="footer-list__title">{t("footer.contact-us")}</div>
				<ul className="footer-list__List">
					<li><a href="mailto:PRENOM@email.fr">PRENOM@email.fr</a></li>
					<li><a href="tel:+phone">PHONE</a></li>
					<li><a href="googlemaplink">ADDRESS</a></li>
				</ul>
			</div>
			<div className="footer-list">
				<div className="footer-list__title">{t("footer.our-plateforms")}</div>
				<ul className="footer-list__List">
					<li><a href="/">Ebay</a></li>
					<li><a href="/">Selency</a></li>
					<li><a href="/">Instagram</a></li>
					<li><a href="/">Facebook</a></li>
				</ul>
			</div>
			<div className="footer-contact">
				<h4>{t("footer.contact-button")}</h4>
				<a href="/contactus">{t("footer.contact-us")}</a> 
			</div>
		</footer>
	)
}