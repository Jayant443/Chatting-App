import defaultAvatar from "../assets/default-profile-icon.jpg";
import { useState } from "react";

function CreateGroupModal({ contacts, onClose, onCreateGrp }) {
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [grpName, setGrpName] = useState('');
    function toggleSelectUser(userId) {
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        }
        else {
            newSelected.add(userId);
        }
        setSelectedUsers(newSelected);
    }

    function handleCreate() {
        if (selectedUsers.size === 0) {
            alert("Please select at least one user.");
            return;
        }
        if (!grpName.trim()) {
            alert("Please enter the name.");
            return;
        }
        onCreateGrp(grpName, Array.from(selectedUsers));
    }

    return (
        <>
            <div className="modal-backdrop">
                <div className="create-group-form">
                    <h3>Create Group</h3>
                    <input id="group-name-input" type="text" placeholder="Enter group name" onChange={(e) => setGrpName(e.target.value)} />
                    <div className="add-member">
                        <h4>Add Members</h4>
                        {contacts.map((contact) => {
                            const userId = contact.id;
                            const isSelected = selectedUsers.has(userId);
                            const isGroup = contact.type === "group";
                            if (!isGroup) {
                                return (
                                    <>
                                        <button key={userId} className="menu-option" style={{ backgroundColor: isSelected ? '#209bcc' : '#383838' }} onClick={() => toggleSelectUser(contact.id)}>
                                            <img src={defaultAvatar} className="avatar" />
                                            <p>{contact?.contact?.username}</p>
                                        </button>
                                    </>
                                );
                            }
                        })}
                    </div>
                    <button type="submit" id="create-group-btn" onClick={handleCreate}>Create</button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </>
    )
}

export default CreateGroupModal;