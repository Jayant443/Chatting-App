function Options({onCreateGroup, onViewProfile}) {
    return (
        <div className="options-menu">
            <button className="menu-option" id="create-group" onClick={onCreateGroup}>Create Group</button>
            <button className="menu-option" id="view-profile" onClick={onViewProfile}>Profile</button>
            <button className="menu-option" id="logout-btn">Logout</button>
        </div>
    )
}

export default Options;