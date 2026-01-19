function Profile({user, onClose}) {
    return (
        <>
            <div className="profile">
                <h3>Profile</h3>
                <div className="profile-details">
                    <p>Username: <span id="profile-username">{user.username}</span></p>
                    <p>Email: <span id="profile-email">{user.email}</span></p>
                    <p>Joined: <span id="profile-join-date">{user.created_at}</span></p>
                </div>
                <button id="update-profile-btn">Update Profile</button>
                <button onClick={onClose}>x</button>
            </div>
        </>
    )
}

export default Profile;