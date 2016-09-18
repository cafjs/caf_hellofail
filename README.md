# CAF (Cloud Assistant Framework)

Co-design permanent, active, stateful, reliable cloud proxies with your web app and gadget.

See http://www.cafjs.com

## CAF example of recovering client and server by using persistent sessions.

The stateless client drives a sequence of item purchases, piggybacking client state information within the session. If there is a failure of either the client or the server, that information can be used by the client to restart the purchase sequence where it was left before the crash, i.e., ensuring items are not bought twice.
