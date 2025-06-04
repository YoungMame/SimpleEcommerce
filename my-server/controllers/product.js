const ProductModel = require("../models/product")
fs = require("fs");

class Product {
    static products = []

    constructor(_id, title, productCode, price, description, tags, featured, quantity, pictures, deliveryWeight, specialDelivery, createdAt) {
        this._id = _id.toString();
        this.title = title;
        this.productCode = productCode;
        this.price = price;
        this.description = description;
        this.tags = tags;
        this.featured = featured;
        this.quantity = quantity;
        this.pictures = pictures;     
        this.deliveryWeight = deliveryWeight;
        this.specialDelivery = specialDelivery;
        this.createdAt = createdAt;
    }

    static isValidProductCode(code) {
        const regex = /^[A-Z][0-9]{4}$/
        return regex.test(code)
    }

    static async create(data) {
        try {
            if(!Product.isValidProductCode(data.productCode)) 
                throw ("Reference invalide");
            const product = new ProductModel(data);
            const result = await product.save();
            const productObject = new Product(
                result._id,
                result.title,
                result.productCode,
                result.price,
                result.description,
                result.tags,
                result.featured,
                result.quantity,
                result.pictures,
                result.deliveryWeight,
                result.specialDelivery,
            );
            Product.products.push(productObject);
            return (true);
        } catch (error) {
            throw (error);
        }
    }

    static async delete(productId) {
        try {
            const result = await ProductModel.findByIdAndDelete(productId);
            if(result) {
                Product.products = Product.products.filter(product => product._id !== productId);
                return (result);
            } else throw ("Erreur during product delete in db");
        } catch (error) {
            throw (error);
        }
    }

    static async find(productId) {
        try {
            const result = await ProductModel.findById(productId)
            if(result) {
                Product.products = Product.products.filter(product => product._id !== productId);
                return result;
            } else throw ("No product with this ID");
        } catch (error) {
            throw error
        }
    }

    static async edit(productId, data) {
        try {
            const foundProduct = Product.products.find(product => product._id === productId)
            if(!foundProduct) {
                throw ("No product found with ID");
            }
            let newPictures = data.pictures.concat(foundProduct.pictures) || [];
            for (const value of data.picturesToDelete) {
                newPictures = newPictures.filter(picture => picture !== value);
            }
            let productObject = {
                title: data.title !== undefined ? data.title : foundProduct.title,
                description: data.description !== undefined ? data.description : foundProduct.description,
                productCode: data.productCode !== undefined ? data.productCode : foundProduct.productCode,
                price: data.price !== undefined ? data.price : foundProduct.price,  // Accepte 0
                tags: data.tags !== undefined ? data.tags : foundProduct.tags,
                quantity: data.quantity !== undefined ? data.quantity : foundProduct.quantity,  // Accepte 0
                featured: data.featured !== undefined ? data.featured : foundProduct.featured,
                deliveryWeight: data.deliveryWeight !== undefined ? data.deliveryWeight : foundProduct.deliveryWeight,  // Accepte 0
                specialDelivery: data.specialDelivery !== undefined ? data.specialDelivery : foundProduct.specialDelivery,
                pictures: data.pictures !== undefined ? newPictures : foundProduct.pictures
            };
            const r = await ProductModel.updateOne({ _id: productId}, {$set: productObject})
            Object.assign(foundProduct, productObject)
        } catch (error) {
            throw (error.message || error);
        }
    }

    static async initialize() {
        const fetchedProducts = await ProductModel.find({})
        Product.products = fetchedProducts.map(p => {
            if (p._id)
                return (new Product(p._id, p.title, p.productCode, p.price, p.description, p.tags, p.featured, p.quantity, p.pictures, p.deliveryWeight, p.specialDelivery));
        })
    }
}

module.exports.createProduct = async (req, res) => {
    let imagesPaths = [];
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json("Aucune image uploadee");
        }
        imagesPaths = req.files.map(file => `api/uploads/images/${file.filename}`);
        if (typeof req.body.tags == "string")
            req.body.tags = req.body.tags.split(",").map(tag => tag.trim())
        await Product.create({
            ...req.body,
            pictures: imagesPaths
        })
        res.status(201).send("Product created")
    } catch (error) {
        if (imagesPaths) {
            imagesPaths.forEach(filePath => {
                const fileName = filePath.split("uploads/images/")[1];
                fs.unlink(`uploads/images/${fileName}`, () => {});
            });
        }
        res.status(500).json("Erreur serveur : "+error || error.message)
    }
}

module.exports.editProduct = async (req, res) => {
    let imagesPaths = [];
    let product = req.body;
    product.pictures = [];
    try {
        if (typeof product.tags === "string") {
            product.tags = product.tags.split(",").map(tag => tag.trim());
        }
        if (product.picturesToDelete && product.picturesToDelete.length > 0) {
            product.picturesToDelete = JSON.parse(product.picturesToDelete);
            const picturesToDelete = product.picturesToDelete;
            for (const filePath of picturesToDelete) {
                try {
                    await fs.unlink(filePath, () => {});
                    console.log(`Image supprimée : ${filePath}`);
                } catch (err) {
                    console.error(`Erreur lors de la suppression de l'image : ${filePath}`, err);
                }
            }
        }
        if (req.files && req.files.length > 0) {
            imagesPaths = req.files.map(file => file.path.replace(/\\/g, '/')); 
            product.pictures = imagesPaths;
        }
        await Product.edit(req.params.id, product);
        res.status(200).send("Produit modifié avec succès");
    } catch (error) {
        imagesPaths.forEach(filePath => {
            fs.unlink(filePath, (err) => {
                if (err) console.error(`Erreur lors de la suppression de l'image: ${filePath}`, err);
            });
        });
        res.status(500).send(`Erreur serveur : ${error}`);
    }
};

module.exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await Product.find(productId);
        if(result) {
            if(result.pictures) {
                try {
                    Product.delete(productId);
                    result.pictures.forEach(filePath => {
                        const fileName = filePath.split("uploads/images/")[1];
                        fs.unlink(`uploads/images/${fileName}`, () => {});
                    });
                } catch (error) {
                    throw error
                }
            }
            res.status(204).send(`Product with id ${productId} was deleted`)
        } else throw "Error during product delete in DB"
    } catch (error) {
        res.status(500).send(`Erreur serveur: ${error}`)
    }
}

module.exports.requestProducts = (req, res) => {
    return (Product.products);
}

module.exports.getProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || Product.products.length;
    const search = req.query.search.toLowerCase() || "";
    const soldAlso = req.query.sold ? true : false;
    const startIndex = (page - 1) * limit; 
    const endIndex = page * limit;
    let orderedProducts = [];

    switch (req.query.order) {
        case "old":
            orderedProducts = Product.products;
        break;
        case "new":
            orderedProducts = Product.products.slice().reverse(); // Inverse l'ordre des produits (dernier ajouté en premier)
        break;
        case "cheap":
            orderedProducts = Product.products.sort((a, b) => a.price - b.price);
        break;
        case "expensive":
            orderedProducts = Product.products.sort((a, b) => b.price - a.price);
        break;
        default:
            orderedProducts = Product.products;
        break;
    }

    const filteredProducts = orderedProducts.filter(product => {
        return (product.title.toLowerCase().includes(search) || 
        product.description.toLowerCase().includes(search) ||
        product.tags.some(tag => tag.toLowerCase().includes(search))) &&
        (product.quantity > 0 || soldAlso);
    });

    const slicedProducts = filteredProducts.slice(startIndex, endIndex);
    let result = {
        result: slicedProducts
    };

    result.previous = {
        limit: limit,
        page: page - 1
    };

    result.next = {
        limit: limit,
        page: page + 1,
        maxPage: Math.ceil(Product.products.length / limit)
    };

    try {
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};


module.exports.getFeaturedProducts = async (req, res) => {
    const filteredProducts = Product.products.reverse().filter( product => {
        return product.featured
    })
    try {
        res.status(200).json(filteredProducts)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.getProduct = async (req, res) => {
    try {
        const idParam = req.params.id
        if(!idParam) throw "no id param"
        const product = Product.products.find( p => p._id === idParam)
        if(!product) throw "no product with this id"
        res.status(200).json(product)
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports.initializeProducts = async () => {
    await Product.initialize()
}


//if you want to store images use imageUpload middleware and store image url with `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`
//filename is edited by the middleware