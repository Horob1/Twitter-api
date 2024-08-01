import getGoogleAuthUrl from "./../getOauthUrl";
import { Link } from "react-router-dom";
export const OAuthLogin = () => {
  return (
    <>
      <h1>OAUTH GOOGLE</h1>
      <div className="card">
        <button>
          <Link to={getGoogleAuthUrl()}>Login with Google</Link>
        </button>
        
      </div>
    </>
  );
};
