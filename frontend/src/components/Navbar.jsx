import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
    return (
        <div className="navbar bg-base-200 px-6 shadow">
            <div className="flex-1">
                <Link to="/" className="text-xl font-bold">
                    Fit-Track
                </Link>
            </div>

            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li>
                        <NavLink to="/">Dashboard</NavLink>
                    </li>
                    <li>
                        <NavLink to="/members/create">Add Member</NavLink>
                    </li>
                    {/* <li>
                        <NavLink to="/members/details">Member Details</NavLink>
                    </li> */}
                    <li>
                        <NavLink to="/payments">Payments</NavLink>
                    </li>

                </ul>
            </div>
        </div>
    );
};

export default Navbar;
