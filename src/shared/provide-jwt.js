// Not used or done yet
import { request } from "http";
import { create } from "njwt";

const client_id = process.env.VUE_APP_CLIENT_ID;
const client_secret = process.env.EXTENSION_SECRET;

const channel_id = "<Twitch Channel ID>";
const user_id = "<Twitch User ID>";
const role = "<User Role | ['backend', 'broadcaster', 'viewer']>";

const generateJwt = () => {
  const exp = new Date().getTime() + 60 * 60 * 1000;

  const secret = new Buffer.from(client_secret, "base64");

  const claims = {
    channel_id,
    client_id,
    role,
    exp,
    user_id,

    opaque_user_id: `U${user_id}`,
  };

  const token = create(claims, secret);
  token.setExpiration(exp);

  return token.compact();
};

const getChannelState = token => {
  const callback = response => {
    let str = "";
    response.on("data", chunk => {
      str += chunk;
    });
    response.on("end", () => {
      console.log(str);
    });
  };

  const req = request(
    {
      hostname: "api.muxy.io",
      port: 80,
      path: "/v1/e/channel_state",
      headers: {
        Authorization: `${client_id} ${token}`,
      },
    },
    callback
  );

  req.end();
};

const token = generateJwt();
getChannelState(token);
