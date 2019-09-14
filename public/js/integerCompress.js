// These are required because integerCompress doesnt support negative numbers

function IntegerCompress(values) {
	for (var i = 0; i < values.length; i++) {
		if (values[i] < 0) {
			// Value is negative
			values[i] = (values[i] * -2) + 1;
		} else {
			// Value is positive
			values[i] = values[i] * 2;
		}
	}
	return FastIntegerCompression.compress(values);
}

function IntegerDecompress(buffer) {
	var values = FastIntegerCompression.uncompress(buffer);
	for (var i = 0; i < values.length; i++) {
		if (values[i] % 2 === 0) {
			// This value is even, it must be positive
			values[i] = values[i] / 2;
		} else {
			// This value must be negative
			values[i] = (values[i] - 1) / (-2);
		}
	}
	return values;
}