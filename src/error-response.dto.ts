export class ErrorResponseDto {

  /**
   * HTTP Status Code
   */
  public readonly statusCode: number;

  /**
   * One or more descriptive error messages.
   */
  public readonly errors: string[];

  /**
   * Optional custom error code
   */
  public readonly errorCode?: string;

}
