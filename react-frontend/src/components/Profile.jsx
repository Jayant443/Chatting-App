function Profile({ user, onClose }) {
    return (
        <>
            <div className="modal-backdrop">
                <div className="profile">
                    <h3>Profile</h3>
                    <div className="profile-details">
                        <p><span className="label">Username:</span><span className="value">{user.username}</span></p>
                        <p><span className="label">Email:</span><span className="value">{user.email}</span></p>
                        <p><span className="label">Joined:</span><span className="value">{user.created_at}</span></p>
                    </div>
                    <button id="update-profile-btn">Update Profile</button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </>
    )
}

export default Profile;