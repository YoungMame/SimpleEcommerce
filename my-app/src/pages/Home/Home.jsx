import "./home.scss";
import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import Carousel from "../../components/Carousel/Carousel";
import { UserContext } from "../../App.jsx";

export default function Home() {
    const { t } = useTranslation();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    let { setSelectedProduct } = useContext(UserContext);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const reponse = await fetch(`/api/product/featured`);
                const data = await reponse.json();
                setFeaturedProducts(data);
                console.log(JSON.stringify(data))
            } catch (error) {
                console.error(error);
            }
        }
        fetchItems();
    }, []);
    return (
        <> 
            <div className="top-flex">
                <a className="top-flex__cta" href="../catalog">{t("home.cta")}</a>
                <a className="top-flex__cta" href="/agenda">{t("home.to_agenda")}</a>
                <img src="/favicon.ico" alt="M'LaBrocante logo" />
            </div>
            <p className="main-quote">{t("home.main-quote")}</p>
            <h4 className="featured-products-title">{t("home.featured-products")}🔥</h4>
            <div className="featured-products-container">
                <Carousel>
                    {
                        featuredProducts.map(product => {
                            return (
                                <div key={product._id} onClick={() => {
                                    setSelectedProduct(product);
                                    window.history.pushState({}, '', '/catalog')
                                    }} className="featured-product">
                                     <div className="featured-product__card" style={{backgroundImage:`url(${product.pictures[0]})`}}>
                                        <div className="featured-product__card__infos">
                                            <h4 className="featured-product__card__infos__title">{product.title}</h4>
                                            <p className="featured-product__card__infos__price">{product.price}€</p>
                                            <p className="featured-product__card__infos__description">{product.description}€</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </Carousel>
            </div>
            <div className="reasurance">
                <div className="reasurance__component">
                    <img src="/safe_payment.png" alt="safe pay" />
                    <h4>{t("home.secure-payment")}</h4>
                    <p>{t("home.secure-payment-text")}</p>
                </div>
                <div className="reasurance__component">
                    <img src="/global_shipping.png" alt="global shipping" />
                    <h4>{t("home.global-shipping")}</h4>
                    <p>{t("home.global-shipping-text")}</p>
                </div>
                <div className="reasurance__component">
                    <img src="/special_shipping.png" alt="special shipping" />
                    <h4>{t("home.delivery-on-quote")}</h4>
                    <p>{t("home.delivery-on-quote-text")}</p>
                </div>
            </div>
        </>
    )
}