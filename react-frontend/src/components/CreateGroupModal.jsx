function CreateGroupModal({onClose}) {
    return (
        <>
            <div className="create-group-form">
                <h3>Create Group</h3>
                <input id="group-name-input" type="text" placeholder="Enter group name" />
                <div className="add-member">
                    <h4>Add Members</h4>
                    <button className="menu-option" id="select-user">
                        <img src="assets/default-profile-icon.jpg" className="avatar" />
                        <p>User</p>
                    </button>
                </div>
                <button type="submit" id="create-group-btn">Create</button>
                <button onClick={onClose}>Close</button>
            </div>
        </>
    )
}

export default CreateGroupModal