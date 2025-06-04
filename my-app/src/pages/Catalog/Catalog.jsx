import "./catalog.scss";
import { useState, useEffect, useContext } from "react";
import { toast } from 'react-toastify';
import Carousel from "../../components/Carousel/Carousel";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../App.jsx";

function ProductCard({selectedProduct, onClose}) {
    const { t } = useTranslation();
    const [amount, setAmount] = useState(1);
    const addProductToCart = async () => {
		const token = localStorage.getItem("mlb_jwt");
		const response = await fetch("/api/user/cart", {
			method: "POST",
			headers: {
				"Authorization": `Bearer ${token}`, 
                "Content-Type": "application/json"
			},
            body: JSON.stringify({
                quantity: amount,
                productId: selectedProduct._id
            })
		})
		if(!response.ok)
		{
			const errorText = await response.text();
			return toast.error(`catalog.${t(errorText)}`);
		}
        toast.success(t("catalog.product-added-to-cart")); 
		return ;
	};
    return (
        <div className="catalog__product-card">
            <div onClick={onClose} className="catalog__product-card__close">x</div>
            <div className="catalog__product-card__carousel-container">
                <Carousel>
                    {
                        selectedProduct.pictures.map(picture => {
                            return (
                                <img className="catalog__product-card__carousel__image" src={picture} alt="Product picture"/>
                            )
                        })
                    }
                </Carousel>
            </div>
            <div className="catalog__product-card__infos">
                <p className="ref">#{selectedProduct.productCode}</p>
                <h5 className="title">{selectedProduct.title}</h5>
                <p className="price">{selectedProduct.price}€</p>
                <p className="description">{selectedProduct.description}</p>
                <label className="quantity-label" htmlFor="amount">{t("catalog.quantity")}</label>
                <input className="quantity-input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)}/>
                <p className="quantity-left">{selectedProduct.quantity} {t("catalog.left")}</p>
                {
                    selectedProduct.deliveryWeight ?
                    <button onClick={addProductToCart} className="buy-button ok" >{t("catalog.add-to-basket")}</button>
                    :
                    <button className="buy-button neutral" >{t("catalog.delivery-not-available")}</button>
                }
                {
                    selectedProduct.specialDelivery ?
                    <p>{t("catalog.special-delivery-available")}</p>
                    :
                    null
                }
            </div>
        </div>
    )
}

export default function Catalog() {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [maxPage, setMaxPage] = useState(null);
    const [order, setOrder] = useState("new");
    const [soldAlso, setSoldAlso] = useState(false);
    let { selectedProduct, setSelectedProduct } = useContext(UserContext);

    useEffect(() => {
        console.log(`new order: ${order}`)
        const fetchItems = async () => {
            try {
                const reponse = await fetch(`/api/product/?page=${page}&limit=${limit}&search=${search}&order=${order}${soldAlso ? "&sold=1" : ""}`);
                const data = await reponse.json();
                setItems(data.result);
                setMaxPage(data.next.maxPage);
            } catch (error) {
                toast.error(error);
            }
        }
        fetchItems();
    }, [page, limit, search, order, soldAlso]);
    useEffect(() => {
        if (selectedProduct)
            document.body.style.overflow = "hidden";
        else 
            document.body.style.overflow = "auto";
    }, [selectedProduct]);
    return (
        <>
            <div className="catalog">
                <div className="catalog__head">
                    <input onChange={(e) => setSearch(e.target.value)} type="text"/>
                    <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000000"><path d="M792-120.67 532.67-380q-30 25.33-69.64 39.67Q423.39-326 378.67-326q-108.44 0-183.56-75.17Q120-476.33 120-583.33t75.17-182.17q75.16-75.17 182.5-75.17 107.33 0 182.16 75.17 74.84 75.17 74.84 182.27 0 43.23-14 82.9-14 39.66-40.67 73l260 258.66-48 48Zm-414-272q79.17 0 134.58-55.83Q568-504.33 568-583.33q0-79-55.42-134.84Q457.17-774 378-774q-79.72 0-135.53 55.83-55.8 55.84-55.8 134.84t55.8 134.83q55.81 55.83 135.53 55.83Z"/></svg>
                </div>
                <div className="catalog__flex">
                    <div className="catalog__flex__filters">
                        <h4>{t("catalog.advanced-search")}</h4>
                        <label htmlFor="filter-by">{t("catalog.filter-by")}
                            <select defaultValue={order} onChange={(e) => setOrder(e.target.value)} name="filter-by" id="">
                                <option value={"old"}>{t("catalog.filter-by-old")}</option>
                                <option value={"new"}>{t("catalog.filter-by-new")}</option>
                                <option value={"cheap"}>{t("catalog.filter-by-cheap")}</option>
                                <option value={"expensive"}>{t("catalog.filter-by-expensive")}</option>
                            </select>
                        </label>
                        <label htmlFor="sold-also">{t("catalog.sold-also")}
                            <input type="checkbox" name="sold-also" onChange={(e) => setSoldAlso(e.target.checked)} />
                        </label>
                    </div>
                    <div className="catalog__flex__products">
                        {
                            items.map(item => {
                                return (
                                    <div style={item.quantity > 0 ? {} : {opacity: 0.5, cursor: "not-allowed"}} key={item._id} className="catalog__flex__products__product" onClick={() => (item.quantity > 0 ? setSelectedProduct(item) : null)}>
                                        <img src={item.pictures[0]} alt="item.pictures[0]" />
                                        <h5>{item.title}</h5>
                                        <p>{item.price}€</p>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="catalog__foot">
                    <div className="catalog__foot__pagination">
                        {
                            (page > 1) ?
                            <>
                                <div onClick={() => setPage(1)} className="min">{"<<"}</div>
                                <div onClick={() => setPage(page - 1)} className="less">{"<"}</div>
                            </>
                            :
                            null
                        }
                        <li className="catalog__foot__pagination__items">
                            {
                                (() => {
                                    let divs = [];
                                    let count = 0;
                                    for (let i = page; count < 5  && i <= maxPage; i++) {
                                        divs.push(<div onClick={() => setPage(i)} key={i} className="catalog__foot__pagination__items__item">
                                            {i}
                                        </div>);
                                        count++;
                                    }
                                    return (divs);
                                })()
                                
                            }
                        </li>
                        {
                            (page < (maxPage)) ?
                            <>
                                <div onClick={() => setPage(page + 1)} className="more">{">"}</div>
                            </>
                            :
                            null
                        }
                        {
                            (page < (maxPage - 5)) ?
                            <>
                                <div onClick={() => setPage(maxPage)} className="max">{">>"}</div>
                            </>
                            :
                            null
                        }
                    </div>
                </div>
            </div>
            {
                selectedProduct ?
                <ProductCard onClose={() => setSelectedProduct(null)} selectedProduct={selectedProduct}/>
                :
                null
            }
        </>
    )
}