package de.sb.radio.rest;

import java.util.List;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import de.sb.toolbox.Copyright;
import de.sb.toolbox.net.HttpCredentials;
import de.sb.toolbox.net.RestCredentials;


/**
 * Minimal HTTP authentication demo, authenticating user "sascha" with password "sascha":
 * <ul>
 * <li>/services/authentication/basic: HTTP "Basic authorization"</li>
 * <li>/services/authentication/digest: HTTP "Digest authorization"</li>
 * </ul>
 * Once a user is authenticated, changing the authentication method or the user-alias, or the
 * password, requires a browser cache clearance or restart.<br />
 * <br />
 * Some notes regarding Basic and Digest authentication: With realm set to "", the transferred
 * response for Digest authentication is MD5(MD5(alias::password)::MD5(httpMethod:uri)). The problem
 * with Digest as an authentication feature is that the last MD5 part changes with every request;
 * this is a necessary security feature when using digest authentication over plain HTTP, but
 * actually becomes a big weakness when using HTTPS due to side effects!<br />
 * <br />
 * This algorithm forces the server side to store MD5(alias::password) within the database, in order
 * to calculate the counterpart to the transferred secret. This basically implies that someone
 * gaining unauthorized access to the database can mass download alias->MD5(alias::password)
 * combinations, analyze the application code (or simply try&error) to find out how the overall MD5
 * is calculated, and thereby gain access to the whole application with any user alias. In contrast,
 * using HTTPS in combination with basic authentication allows the server side to store (for
 * example) a strong SHA-256 hash of the password within the database, hash the transferred secret,
 * and use this hash value to authenticate a given user; an attacker who downloaded these hash
 * values cannot use them for anything within the application, because she/he cannot recalculate the
 * required password from it.<br />
 * <br />
 * In the end, any authentication scheme is only as safe as it's weakest link. If we assign relative
 * "security worthiness" for the combinations of transport and storage technology, the difference
 * between Basic and Digest authentication quickly becomes obvious:
 * <ul>
 * <li>min(HTTP + Basic, SHA(secret) == storage) = min(zero + low, high) = low</li>
 * <li>min(HTTPS + Basic, SHA(secret) == storage) = min(high + low, high) = high</li>
 * <li>min(HTTP + Digest, secret == f(storage)) = min(zero + mid, mid) = mid</li>
 * <li>min(HTTPS + Digest, secret == f(storage)) = min(high + mid, mid) = mid</li>
 * </ul>
 * Result: While Digest authentication is much better than Basic when combined with HTTP transport,
 * it is much worse than Basic when combined with HTTPS. Unsurprisingly so, because non-encrypted
 * transport is exactly what Digest authentication was designed for. If strong stored hashes get
 * stolen from an application that uses HTTPS and Basic authentication, it may trigger bad press,
 * but no catastrophe. If the stored hashes get stolen from an application that uses HTTPS and
 * Digest authentication, you'd best reset all user accounts immediately, because your remaining
 * security margin is minimal, and no defense against determined attack.<br />
 * <br />
 * It is a perfect example of how blindly piling up security measures often does not result in
 * stronger security, but rather weakens a system decisively due to side-effects. That it's
 * designers believed Digest would completely supersede Basic authentication (see RFC 2617) is their
 * lasting shame, and no excuse for you to fall for the same illusion. After all, you have been
 * told.
 */
@Path("authentication")
@Copyright(year=2013, holders="Sascha Baumeister")
public class AuthenticatorDemoService {
	static private String AUTHENTICATED_AND_AUTORIZED = "thou mayest pass! (I authenticated you as %s, and as such you're also authorized to proceed)";
	static private String AUTHENTICATED_BUT_NOT_AUTORIZED = "thou shalt not pass! (I authenticated you as %s, but you are not authorized to proceed)";


	@GET
	@Path("basic")
	public Response basicAuthentication (@HeaderParam("Authorization") final String authentication) {
		final HttpCredentials.Basic credentials = RestCredentials.newBasicInstance(authentication);

		// Perform authentication check, only matching username/password combinations are authenticated
		if (!credentials.getUsername().equals(credentials.getPassword())) {
			// simulate failed uid/pw lookup, return code 401
			throw new NotAuthorizedException("Basic"); 
		}

		// Perform authorization check, only user sascha is authorized
		if (!"sascha".equals(credentials.getUsername())) {
			// return code 403 (unusual case with entity, normally just throw javax.ws.rs.ForbiddenException)
			return Response.status(Status.FORBIDDEN).entity(String.format(AUTHENTICATED_BUT_NOT_AUTORIZED, credentials.getUsername())).build();
		}

		// generate code 200 response for authorized user sascha only
		return Response.status(Status.OK).entity(String.format(AUTHENTICATED_AND_AUTORIZED, credentials.getUsername())).build();
	}


	@GET
	@Path("basic-clumsy")
	public Response basicAuthentication (@Context final HttpHeaders headers) {
		final List<String> authentications = headers.getRequestHeader(HttpHeaders.AUTHORIZATION);
		if (authentications == null) throw new NotAuthorizedException("Basic");	// code 401
		if (authentications.size() != 1) throw new BadRequestException();		// code 400

		final String authentication = authentications.get(0);
		return this.basicAuthentication(authentication);
	}


	@GET
	@Path("digest")
	public Response digestAuthentication (@HeaderParam("Authorization") final String authentication) {
		final HttpCredentials.Digest credentials = RestCredentials.newDigestInstance(authentication);

		// Perform authentication check, only matching username/password combinations are authenticated. Note
		// the reversal of direction in comparison with HTTP Basic authentication, in a real-world scenario
		// the password has to be queried from the data store instead of being passed with the REST request!
		final String checkMethod = "get";					// we know we're performing a GET request
		final String checkPassword = credentials.getUsername(); 
		final String checkResponse = HttpCredentials.newDigestResponse(credentials.getUsername(), credentials.getRealm(), checkPassword, checkMethod, credentials.getUri(), credentials.getNonce());
		
		if (!credentials.getResponse().equalsIgnoreCase(checkResponse)) {
			// simulate failed uid/pw lookup, return code 401
			throw new NotAuthorizedException("Digest realm=\"\"");
		}

		// Perform authorization check, only user sascha is authorized
		if (!"sascha".equals(credentials.getUsername())) {
			// return code 403 (unusual case with entity, normally just throw javax.ws.rs.ForbiddenException)
			return Response.status(Status.FORBIDDEN).entity(String.format(AUTHENTICATED_BUT_NOT_AUTORIZED, credentials.getUsername())).build();
		}

		// generate code 200 response for authorized user sascha only
		return Response.status(Status.OK).entity(String.format(AUTHENTICATED_AND_AUTORIZED, credentials.getUsername())).build();
	}
}