
import User from "../../../DB/Models/user.model.js";
import Messages from "../../../DB/Models/message.model.js";


export const sendMessageService = async (req, res, next) => {
    const { content } = req.body;
    const { receiverId } = req.params;

    const user = await User.findById(receiverId);
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }

    const message = await Messages.create({
        content,
        receiverId
    });

    await message.save();
    return res.status(200).json({ message: "Message sent successfully", message });
}

export const listMessagesService = async (req, res) => {
    const messages = await Messages.find().populate(
        [
            {
                path: "receiverId",
                select: "firstName lastName"
            }
        ]
    );
    return res.status(200).json({ message: "Messages fetched successfully", messages });
}