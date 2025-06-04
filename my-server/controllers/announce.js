const AnnounceModel = require("../models/announce")
fs = require("fs");

class Announce {
    static announces = []

    constructor(_id, title, text, author, place, date, duration, image) {
        this._id = _id.toString();
        this.title = title;
        this.text = text;
        this.author = author;
        this.place = place;
        this.date = date;
        this.duration = duration;
        this.image = image;
    }

    static async create(data) {
        try {
            const announce = new AnnounceModel(data);
            const result = await announce.save();
            const announceObject = new Announce(
                result._id,
                result.title,
                result.text,
                result.author,
                result.place,
                result.date,
                result.duration,
                result.image
            );
            Announce.announces.push(announceObject);
            return (true);
        } catch (error) {
            throw (error);
        }
    }

    static async delete(announceId) {
        try {
            const result = await AnnounceModel.findByIdAndDelete(announceId);
            if(result) {
                Announce.announces = Announce.announces.filter(announce => announce._id !== announceId);
                return (result);
            } else throw ("Erreur during announce delete in db");
        } catch (error) {
            throw (error);
        }
    }

    static async find(announceId) {
        try {
            const result = await AnnounceModel.findById(announceId)
            if(result) {
                Announce.announces = Announce.announces.filter(announce => announce._id !== announceId);
                return result;
            } else throw ("No announce with this ID");
        } catch (error) {
            throw error
        }
    }

    static async edit(announceId, data) {
        try {
            const foundAnnounce = Announce.announces.find(announce => announce._id === announceId)
            if(!foundAnnounce) {
                throw ("No announce found with ID");
            }
            let announceObject = {
                title: data.title !== undefined ? data.title : foundAnnounce.title,
                text: data.text !== undefined ? data.text : foundAnnounce.text,
                place: data.place !== undefined ? data.place : foundAnnounce.place,
                date: data.date !== undefined ? data.date : foundAnnounce.date,
                duration: data.duration !== undefined ? data.duration : foundAnnounce.duration,
                image: data.image !== undefined ? data.image : foundAnnounce.image
            };
            const r = await AnnounceModel.updateOne({ _id: announceId}, {$set: announceObject})
            Object.assign(foundAnnounce, announceObject)
        } catch (error) {
            throw (error.message || error);
        }
    }

    static async initialize() {
        const fetchedAnnounces = await AnnounceModel.find({})
        Announce.announces = fetchedAnnounces.map(p => {
            if (p._id)
                return (new Announce(p._id, p.title, p.text, p.author, p.place, p.date, p.duration, p.image));
        })
    }
}

module.exports.createAnnounce = async (req, res) => {
    let imagePath = null;
    try {
        if (req.file)
            imagePath = `api/uploads/images/${req.file.filename}`;
        await Announce.create({
            ...req.body,
            image: imagePath
        })
        res.status(201).send("Announce created")
    } catch (error) {
        if (imagePath) {
            const fileName = imagePath.split("uploads/images/")[1];
            fs.unlink(`uploads/images/${fileName}`, () => {});
        }
        res.status(500).json("Erreur serveur : "+error || error.message)
    }
}

module.exports.editAnnounce = async (req, res) => {
    let imagePath = null;
    let announce = req.body;
    try {
        if (typeof announce.tags === "string") {
            announce.tags = announce.tags.split(",").map(tag => tag.trim());
        }
        if (announce.pictureToDelete) {
            try {
                await fs.unlink(announce.pictureToDelete, () => {});
                announce.image = null;
                console.log(`Image supprimée : ${announce.pictureToDelete}`);
            } catch (err) {
                console.error(`Erreur lors de la suppression de l'image : ${announce.pictureToDelete}`, err);
            }
        }
        if (req.file) {
            imagesPath = req.file.path.replace(/\\/g, '/'); 
            announce.image = imagePath;
        }
        await Announce.edit(req.params.id, announce);
        res.status(200).send("Annonce modifié avec succès");
    } catch (error) {
        if (imagePath) {
            fs.unlink(imagePath, (err) => {
                if (err) console.error(`Erreur lors de la suppression de l'image: ${imagePath}`, err);
            });
        }
        res.status(500).send(`Erreur serveur : ${error}`);
    }
};

module.exports.deleteAnnounce = async (req, res) => {
    try {
        const AnnounceId = req.params.id;
        const result = await Announce.find(AnnounceId);
        if(result) {
            if(result.image) {
                try {
                    Announce.delete(AnnounceId);
                    const fileName = result.image.split("uploads/images/")[1];
                    fs.unlink(`uploads/images/${fileName}`, () => {});
                } catch (error) {
                    throw error
                }
            }
            else {
                try {
                    Announce.delete(AnnounceId);
                } catch (error) {
                    throw error
                }
            }
            res.status(204).send(`Announce with id ${AnnounceId} was deleted`)
        } else throw "Error during Announce delete in DB"
    } catch (error) {
        res.status(500).send(`Erreur serveur: ${error}`)
    }
}

module.exports.getAnnounces = async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || Announce.announces.length;
    const search = req.query.search.toLowerCase() || "";
    const startIndex = ( page - 1) * limit;
    const endIndex = page * limit;
    const reversedAnnounces = Announce.announces.slice().reverse();
    const filteredAnnounces = reversedAnnounces.filter( announce => {
        return announce.title.toLowerCase().includes(search) || 
        announce.text.toLowerCase().includes(search)
    });
    const slicedAnnounces = filteredAnnounces.slice(startIndex, endIndex)
    let result = {
        result : slicedAnnounces
    }
    if(page > 1) {
        result.previous = {
            limit: limit,
            page: page - 1
        }
    }
    if(endIndex < Announce.announces.length) {
        result.next = {
            limit: limit,
            page: page + 1,
            maxPage: Math.ceil(Announce.announces.length/limit)
        }
    }
    try {
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports.initializeAnnounces = async () => {
    await Announce.initialize()
}


//if you want to store images use imageUpload middleware and store image url with `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`
//filename is edited by the middleware