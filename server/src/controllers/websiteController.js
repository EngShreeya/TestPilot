import {
    createWebsite,
    deleteWebsite,
    getWebsiteById,
    listWebsites,
    updateWebsite,
} from "../service/websiteService.js";

export async function create(req, res) {
    const website = await createWebsite(req.user.id, req.body);

    res.status(201).json({
        success: true,
        message: "Website added successfully",
        website,
    });
}

export async function list(req, res) {
    const { websites, summary } = await listWebsites(req.user.id, req.query);

    res.status(200).json({
        success: true,
        websites,
        summary,
    });
}

export async function getOne(req, res) {
    const website = await getWebsiteById(req.user.id, req.params.id);

    res.status(200).json({
        success: true,
        website,
    });
}

export async function update(req, res) {
    const website = await updateWebsite(req.user.id, req.params.id, req.body);

    res.status(200).json({
        success: true,
        message: "Website updated successfully",
        website,
    });
}

export async function remove(req, res) {
    const website = await deleteWebsite(req.user.id, req.params.id);

    res.status(200).json({
        success: true,
        message: "Website deleted successfully",
        website,
    });
}

