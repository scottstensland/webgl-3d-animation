

    var gl = canvas.context;
    var frameBuf = gl.createFramebuffer();
    var renderBuf = gl.createRenderbuffer();
    var pickTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, pickTexture);

    var width = 400;
    var height = 400;

    try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
    } catch (e) {
        // Null rejected
        var tex = new WebGLUnsignedByteArray(width * height * 3);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, tex);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf);
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuf);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pickTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuf);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);


    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf);

    if (!gl.isFramebuffer(frameBuf)) {
        throw("Invalid framebuffer");
    }
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    switch (status) {
        case gl.FRAMEBUFFER_COMPLETE:
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            break;
        case gl.FRAMEBUFFER_UNSUPPORTED:
            throw("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            break;
        default:
            throw("Incomplete framebuffer: " + status);
    }

    